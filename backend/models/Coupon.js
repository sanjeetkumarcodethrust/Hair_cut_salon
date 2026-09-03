import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    salon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salon',
      required: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
    },
    maxDiscount: {
      type: Number, // Optional cap for percentage discounts
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    applicableServices: [
      {
        type: mongoose.Schema.Types.ObjectId,
      }
    ],
    status: {
      type: String,
      enum: ['active', 'paused', 'expired', 'exhausted'],
      default: 'active',
    },
    startAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
    },
    usageLimit: {
      type: Number, // Total times this coupon can be used
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    perCustomerLimit: {
      type: Number,
      default: 1,
    }
  },
  { timestamps: true }
);

// Ensure unique codes per salon
couponSchema.index({ salon: 1, code: 1 }, { unique: true });

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
