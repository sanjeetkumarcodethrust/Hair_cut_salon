import re

# 1. Update User.js
with open('backend/models/User.js', 'r', encoding='utf-8') as f:
    user_content = f.read()

user_fields = """
    loyaltyPoints: {
      type: Number,
      default: 0
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
"""

if "loyaltyPoints:" not in user_content:
    user_content = user_content.replace("    role: {", user_fields + "    role: {")
    with open('backend/models/User.js', 'w', encoding='utf-8') as f:
        f.write(user_content)
    print("Updated User.js")

# 2. Create LoyaltyTransaction.js
loyalty_tx_code = """import mongoose from 'mongoose';

const loyaltyTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['earned', 'redeemed', 'refund_reversed', 'referral_bonus', 'manual_adjustment', 'expiration'],
      required: true,
    },
    points: {
      type: Number,
      required: true, // Can be positive or negative
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId, // Could be Appointment ID, User ID (for referral)
    },
    description: {
      type: String,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    }
  },
  { timestamps: true }
);

loyaltyTransactionSchema.index({ user: 1, createdAt: -1 });
loyaltyTransactionSchema.index({ referenceId: 1 }); // For idempotency checks

const LoyaltyTransaction = mongoose.model('LoyaltyTransaction', loyaltyTransactionSchema);
export default LoyaltyTransaction;
"""
with open('backend/models/LoyaltyTransaction.js', 'w', encoding='utf-8') as f:
    f.write(loyalty_tx_code)
print("Created LoyaltyTransaction.js")

# 3. Update authController.js
with open('backend/controllers/authController.js', 'r', encoding='utf-8') as f:
    auth_content = f.read()

if "req.body" in auth_content and "referralCode" not in auth_content:
    auth_content = auth_content.replace(
        "const { name, email, password, role, phone } = req.body;",
        "const { name, email, password, role, phone, referralCode } = req.body;"
    )
    
    auth_logic = """
    let referredBy = null;
    if (referralCode) {
       const referrer = await User.findOne({ referralCode: referralCode.toUpperCase().trim() });
       if (referrer) referredBy = referrer._id;
    }

    // Generate unique referral code for this user
    const newReferralCode = (name.substring(0, 4) + Math.floor(1000 + Math.random() * 9000)).toUpperCase().replace(/\s/g, '');
    """
    
    auth_content = auth_content.replace(
        "const user = await User.create({",
        auth_logic + "\n      const user = await User.create({\n        referralCode: newReferralCode,\n        referredBy,"
    )
    
    with open('backend/controllers/authController.js', 'w', encoding='utf-8') as f:
        f.write(auth_content)
    print("Updated authController.js")
