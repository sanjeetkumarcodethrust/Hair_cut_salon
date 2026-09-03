import re

with open('backend/controllers/appointmentController.js', 'r', encoding='utf-8') as f:
    content = f.read()

coupon_logic = """
    let finalPrice = service.price;
    let originalPrice = service.price;
    let discountApplied = null;
    let discountAmount = 0;
    let couponId = null;

    if (req.body.couponCode) {
      const Coupon = (await import('../models/Coupon.js')).default;
      const coupon = await Coupon.findOne({ salon: shopId, code: req.body.couponCode.toUpperCase().trim() });
      if (!coupon) throw new Error('Invalid coupon code');
      if (coupon.status !== 'active') throw new Error(`Coupon is ${coupon.status}`);
      if (coupon.startAt && new Date() < new Date(coupon.startAt)) throw new Error('Coupon is not yet active');
      if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
        coupon.status = 'expired'; await coupon.save(); throw new Error('Coupon has expired');
      }
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        coupon.status = 'exhausted'; await coupon.save(); throw new Error('Coupon usage limit reached');
      }
      if (coupon.minOrderValue && finalPrice < coupon.minOrderValue) throw new Error(`Minimum booking value of ₹${coupon.minOrderValue} required`);
      
      if (coupon.perCustomerLimit) {
         const userUsage = await Appointment.countDocuments({
           customer: req.user._id,
           couponId: coupon._id,
           status: { $nin: ['cancelled', 'pending'] }
         });
         if (userUsage >= coupon.perCustomerLimit) throw new Error('You have reached the maximum usage limit for this coupon');
      }

      if (coupon.discountType === 'percentage') {
        discountAmount = (finalPrice * coupon.discountValue) / 100;
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) discountAmount = coupon.maxDiscount;
      } else {
        discountAmount = coupon.discountValue;
      }
      if (discountAmount > finalPrice) discountAmount = finalPrice;
      
      finalPrice = finalPrice - discountAmount;
      discountApplied = coupon.code;
      couponId = coupon._id;
      
      // Atomically increment usage
      await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usageCount: 1 } });
    } else if (salon.activeOffer && salon.activeOffer.isActive) {
       discountApplied = salon.activeOffer.title;
       if (salon.activeOffer.discountValue && salon.activeOffer.discountValue.includes('%')) {
          const pct = parseInt(salon.activeOffer.discountValue);
          discountAmount = (finalPrice * pct / 100);
          finalPrice = finalPrice - discountAmount;
       }
    }
"""

content = re.sub(
    r"let finalPrice = service\.price;\s*let discountApplied = null;\s*if \(salon\.activeOffer && salon\.activeOffer\.isActive\) \{[\s\S]*?finalPrice = finalPrice - \(finalPrice \* pct / 100\);\s*\}\s*\}",
    coupon_logic,
    content
)

# Insert new fields into appointment payload
appointment_payload_injection = """
      originalPrice,
      discountAmount,
      couponCode: discountApplied,
      couponId,
"""

content = re.sub(
    r"endTime: eTime\.toDate\(\),\s*price: finalPrice,",
    "endTime: eTime.toDate(),\n" + appointment_payload_injection + "        price: finalPrice,",
    content
)

with open('backend/controllers/appointmentController.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated appointmentController.js with backend coupon validation")
