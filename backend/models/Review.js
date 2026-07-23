import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Either salon or barber must be provided
    salon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salon',
    },
    barber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BarberProfile',
    },
    rating: {
      type: Number,
      required: [true, 'Please add a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please add a comment'],
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// One review per customer per salon
reviewSchema.index({ salon: 1, customer: 1 }, { unique: true, sparse: true });
// One review per customer per barber
reviewSchema.index({ barber: 1, customer: 1 }, { unique: true, sparse: true });

// ─── Auto-update Salon rating ────────────────────────────────────────────────
reviewSchema.statics.updateSalonRating = async function (salonId) {
  if (!salonId) return;
  const result = await this.aggregate([
    { $match: { salon: salonId } },
    {
      $group: {
        _id: '$salon',
        rating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);
  await mongoose.model('Salon').findByIdAndUpdate(salonId, {
    rating: result[0] ? Math.round(result[0].rating * 10) / 10 : 0,
    totalReviews: result[0] ? result[0].totalReviews : 0,
  });
};

// ─── Auto-update Barber rating ───────────────────────────────────────────────
reviewSchema.statics.updateBarberRating = async function (barberId) {
  if (!barberId) return;
  const result = await this.aggregate([
    { $match: { barber: barberId } },
    {
      $group: {
        _id: '$barber',
        rating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);
  await mongoose.model('BarberProfile').findByIdAndUpdate(barberId, {
    rating: result[0] ? Math.round(result[0].rating * 10) / 10 : 0,
    totalReviews: result[0] ? result[0].totalReviews : 0,
  });
};

// ─── Hooks ───────────────────────────────────────────────────────────────────
reviewSchema.post('save', async function () {
  if (this.salon) await this.constructor.updateSalonRating(this.salon);
  if (this.barber) await this.constructor.updateBarberRating(this.barber);
});

reviewSchema.post('findOneAndDelete', async function (doc) {
  if (!doc) return;
  if (doc.salon) await doc.constructor.updateSalonRating(doc.salon);
  if (doc.barber) await doc.constructor.updateBarberRating(doc.barber);
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
