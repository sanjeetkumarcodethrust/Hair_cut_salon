import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a job title'],
      trim: true,
    },
    salon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salon',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a job description'],
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: Number, // minimum years required
      default: 0,
    },
    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'INR' },
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
    },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'freelance', 'internship'],
      default: 'full-time',
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
    deadline: {
      type: Date,
    },
    totalApplications: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Full-text search index
jobSchema.index({ title: 'text', description: 'text', location: 'text' });

const Job = mongoose.model('Job', jobSchema);
export default Job;
