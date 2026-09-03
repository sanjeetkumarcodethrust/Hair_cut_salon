import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    salon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salon',
      required: true,
    },
    barber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BarberProfile',
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    serviceName: {
      type: String,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['published', 'hidden', 'reported'],
      default: 'published',
    },
    ownerReply: {
      type: String,
      maxlength: 500,
    },
    repliedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// One review per appointment
reviewSchema.index({ appointment: 1 }, { unique: true });
// For fetching reviews for a salon
reviewSchema.index({ salon: 1, status: 1, createdAt: -1 });
// For fetching reviews for a barber
reviewSchema.index({ barber: 1, status: 1, createdAt: -1 });
// For fetching a customer's reviews
reviewSchema.index({ customer: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
