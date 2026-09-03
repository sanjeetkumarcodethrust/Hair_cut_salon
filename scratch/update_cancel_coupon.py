import re

with open('backend/controllers/appointmentController.js', 'r', encoding='utf-8') as f:
    content = f.read()

cancel_logic = """
    appointment.status = 'cancelled';
    appointment.cancellationReason = req.body.reason || '';
    await appointment.save();

    // Restore coupon usage if any
    if (appointment.couponId) {
      const Coupon = (await import('../models/Coupon.js')).default;
      await Coupon.findByIdAndUpdate(appointment.couponId, { $inc: { usageCount: -1 } });
    }
"""

content = re.sub(
    r"appointment\.status = 'cancelled';\s*appointment\.cancellationReason = req\.body\.reason \|\| '';\s*await appointment\.save\(\);",
    cancel_logic,
    content
)

with open('backend/controllers/appointmentController.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated cancelAppointment to restore coupon usage")
