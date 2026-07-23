import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    barberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resume: {
      url: { type: String, required: [true, 'Please upload a resume'] },
      publicId: { type: String }, // Cloudinary public_id for deletion
      originalName: { type: String },
    },
    experience: {
      type: Number,
      required: [true, 'Please provide your years of experience'],
      default: 0,
    },
    coverLetter: {
      type: String,
      maxlength: [1000, 'Cover letter cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'],
      default: 'pending',
    },
    ownerNotes: {
      // Internal notes visible only to the owner
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// One application per barber per job
applicationSchema.index({ jobId: 1, barberId: 1 }, { unique: true });

// Auto-increment job totalApplications on new application
applicationSchema.post('save', async function () {
  await mongoose.model('Job').findByIdAndUpdate(this.jobId, {
    $inc: { totalApplications: 1 },
  });
});

const Application = mongoose.model('Application', applicationSchema);
export default Application;
