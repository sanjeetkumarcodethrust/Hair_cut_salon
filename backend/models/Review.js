import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    salon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salon',
      required: true,
    },
    barber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BarberProfile', // Optional: if the review is specific to a barber
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    },
  },
  {
    timestamps: true,
  }
);

// Prevent user from submitting more than one review per salon
reviewSchema.index({ salon: 1, customer: 1 }, { unique: true });

// Static method to get average rating and save
reviewSchema.statics.getAverageRating = async function (salonId) {
  const obj = await this.aggregate([
    {
      $match: { salon: salonId },
    },
    {
      $group: {
        _id: '$salon',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    await this.model('Salon').findByIdAndUpdate(salonId, {
      averageRating: obj[0] ? Math.round(obj[0].averageRating * 10) / 10 : 0,
      totalReviews: obj[0] ? obj[0].totalReviews : 0,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
reviewSchema.post('save', function () {
  this.constructor.getAverageRating(this.salon);
});

// Call getAverageRating before remove (if using remove middleware, for modern mongoose use deleteOne)
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.getAverageRating(doc.salon);
  }
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
