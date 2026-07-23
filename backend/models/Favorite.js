import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Either salon or barber must be set
    salon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salon',
    },
    barber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BarberProfile',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate favorites
favoriteSchema.index({ customer: 1, salon: 1 }, { unique: true, sparse: true });
favoriteSchema.index({ customer: 1, barber: 1 }, { unique: true, sparse: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);
export default Favorite;
