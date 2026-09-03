import mongoose from 'mongoose';

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
