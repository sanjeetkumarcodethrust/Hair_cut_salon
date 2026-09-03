import mongoose from 'mongoose';

const recentlyViewedSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    entityType: {
      type: String,
      enum: ['shop', 'service'],
      required: true,
      default: 'shop'
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salon',
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    }
  },
  { timestamps: true }
);

recentlyViewedSchema.index({ customer: 1, entityType: 1, shop: 1, service: 1 }, { unique: true });
recentlyViewedSchema.index({ customer: 1, viewedAt: -1 });

const RecentlyViewed = mongoose.model('RecentlyViewed', recentlyViewedSchema);
export default RecentlyViewed;
