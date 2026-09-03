import re

with open('backend/controllers/appointmentController.js', 'r', encoding='utf-8') as f:
    content = f.read()

# I will inject the redemption calculation right before `const appointment = new Appointment({...})`
# The final price calculation is already happening. I'll add loyalty reduction.

loyalty_calc = """
      // Loyalty Redemption Logic
      let loyaltyDiscountAmount = 0;
      let pointsRedeemed = 0;
      let loyaltyUserUpdate = null;
      if (req.body.redeemPoints && req.body.redeemPoints > 0) {
        const User = (await import('../models/User.js')).default;
        const customerDoc = await User.findById(req.user._id).session(useTransaction ? session : null);
        pointsRedeemed = parseInt(req.body.redeemPoints);
        if (customerDoc.loyaltyPoints < pointsRedeemed) throw new Error('Insufficient loyalty points');
        
        loyaltyDiscountAmount = pointsRedeemed / 10; // 10 points = 1 INR
        if (loyaltyDiscountAmount > finalPrice) {
          loyaltyDiscountAmount = finalPrice;
          pointsRedeemed = Math.ceil(loyaltyDiscountAmount * 10);
        }
        
        finalPrice -= loyaltyDiscountAmount;
        
        // Atomically deduct
        loyaltyUserUpdate = await User.findByIdAndUpdate(
          req.user._id,
          { $inc: { loyaltyPoints: -pointsRedeemed } },
          { new: true, session: useTransaction ? session : null }
        );
      }
"""

# Replace in createInstantBooking and createScheduledBooking where finalPrice is calculated.
# We will inject this before the Appointment object is created.
content = re.sub(
    r"const appointment = new Appointment\(\{",
    loyalty_calc + "\n      const appointment = new Appointment({",
    content
)

# Insert the fields into Appointment creation
apt_fields = """
        loyaltyDiscountAmount,
        pointsRedeemed,
"""

content = re.sub(
    r"couponId,\s*price: finalPrice,",
    "couponId,\n" + apt_fields + "        price: finalPrice,",
    content
)

# And then we need to log the transaction after saving the appointment
loyalty_tx = """
      if (pointsRedeemed > 0 && loyaltyUserUpdate) {
        const LoyaltyTransaction = (await import('../models/LoyaltyTransaction.js')).default;
        await LoyaltyTransaction.create([{
          user: req.user._id,
          type: 'redeemed',
          points: -pointsRedeemed,
          referenceId: appointment._id,
          description: `Redeemed for booking ${appointment._id.toString().substring(0, 6)}`,
          balanceAfter: loyaltyUserUpdate.loyaltyPoints
        }], useTransaction ? { session } : undefined);
      }
"""

content = re.sub(
    r"await appointment\.save\(useTransaction \? \{ session \} : undefined\);\s*// Phase 6:",
    "await appointment.save(useTransaction ? { session } : undefined);\n" + loyalty_tx + "\n      // Phase 6:",
    content
)

with open('backend/controllers/appointmentController.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated appointmentController with loyalty redemption")
