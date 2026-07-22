import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true }, // in minutes
});

const barberProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
    },
    profilePhoto: {
      type: String,
    },
    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salon',
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    specialization: {
      type: [String],
      default: [],
    },
    experience: {
      type: Number,
      default: 0,
    },
    skills: {
      type: [String],
      default: [],
    },
    availability: {
      monday: { start: String, end: String, isWorking: { type: Boolean, default: false } },
      tuesday: { start: String, end: String, isWorking: { type: Boolean, default: false } },
      wednesday: { start: String, end: String, isWorking: { type: Boolean, default: false } },
      thursday: { start: String, end: String, isWorking: { type: Boolean, default: false } },
      friday: { start: String, end: String, isWorking: { type: Boolean, default: false } },
      saturday: { start: String, end: String, isWorking: { type: Boolean, default: false } },
      sunday: { start: String, end: String, isWorking: { type: Boolean, default: false } },
    },
    portfolio: {
      type: [String],
      default: [],
    },
    gallery: {
      type: [String],
      default: [],
    },
    services: [serviceSchema],
    rating: {
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
