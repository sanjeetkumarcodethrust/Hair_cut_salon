import mongoose from 'mongoose';

const barberProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    salon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salon', // Can be null if freelance, but for this platform usually tied to a salon
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    specialties: {
      type: [String],
      default: [],
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    workingHours: {
      // Barber's specific working hours within the salon's hours
      monday: { start: String, end: String, isWorking: { type: Boolean, default: false } },
      tuesday: { start: String, end: String, isWorking: { type: Boolean, default: false } },
      wednesday: { start: String, end: String, isWorking: { type: Boolean, default: false } },
      thursday: { start: String, end: String, isWorking: { type: Boolean, default: false } },
      friday: { start: String, end: String, isWorking: { type: Boolean, default: false } },
      saturday: { start: String, end: String, isWorking: { type: Boolean, default: false } },
      sunday: { start: String, end: String, isWorking: { type: Boolean, default: false } },
    },
    portfolio: {
      type: [String], // Array of image URLs
      default: [],
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const BarberProfile = mongoose.model('BarberProfile', barberProfileSchema);
export default BarberProfile;
