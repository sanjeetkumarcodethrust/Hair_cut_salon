import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salon',
    },
    service: {
      type: mongoose.Schema.Types.ObjectId, // if saving a specific service
    },
    barber: {
      type: mongoose.Schema.Types.ObjectId, // if saving a specific barber
    },
    type: {
      type: String,
      enum: ['shop', 'service', 'barber'],
      required: true,
      default: 'shop'
    }
  },
  { timestamps: true }
);

// Prevent duplicate favorites
favoriteSchema.index({ customer: 1, shop: 1, service: 1, barber: 1, type: 1 }, { unique: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);
export default Favorite;
