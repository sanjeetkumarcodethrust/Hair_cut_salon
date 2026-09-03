import re

with open('backend/controllers/appointmentController.js', 'r', encoding='utf-8') as f:
    content = f.read()

completion_logic = """
    appointment.status = 'completed';
    
    // Loyalty Reward Logic
    const pointsEarned = Math.floor(appointment.price / 10); // 1 point per ₹10
    appointment.loyaltyPointsEarned = pointsEarned;
    await appointment.save();

    const User = (await import('../models/User.js')).default;
    const LoyaltyTransaction = (await import('../models/LoyaltyTransaction.js')).default;
    
    const customer = await User.findByIdAndUpdate(
      appointment.customer, 
      { $inc: { loyaltyPoints: pointsEarned } }, 
      { new: true }
    );
    
    if (customer) {
      await LoyaltyTransaction.create({
        user: customer._id,
        type: 'earned',
        points: pointsEarned,
        referenceId: appointment._id,
        description: `Points earned for booking ${appointment._id.toString().substring(0,6)}`,
        balanceAfter: customer.loyaltyPoints
      });
      
      // Check Referral Bonus (if this is the first completed booking)
      const completedCount = await Appointment.countDocuments({ customer: customer._id, status: 'completed' });
      if (completedCount === 1 && customer.referredBy) {
         const referralBonus = 500; // 500 points for successful referral
         const referrer = await User.findByIdAndUpdate(
           customer.referredBy,
           { $inc: { loyaltyPoints: referralBonus } },
           { new: true }
         );
         if (referrer) {
           await LoyaltyTransaction.create({
             user: referrer._id,
             type: 'referral_bonus',
             points: referralBonus,
             referenceId: customer._id,
             description: `Bonus for referring ${customer.name}`,
             balanceAfter: referrer.loyaltyPoints
           });
         }
      }
    }
"""

content = re.sub(
    r"appointment\.status = 'completed';\s*await appointment\.save\(\);",
    completion_logic,
    content
)

with open('backend/controllers/appointmentController.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated completeAppointment to award points")
