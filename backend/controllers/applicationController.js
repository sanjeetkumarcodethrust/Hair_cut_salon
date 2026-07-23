import Application from '../models/Application.js';
import Job from '../models/Job.js';
import cloudinary from '../utils/cloudinary.js';
import fs from 'fs';

// ─── BARBER — Apply ───────────────────────────────────────────────────────────

// @desc    Apply for a job (with resume upload)
// @route   POST /api/applications/:jobId/apply
// @access  Private/Barber
export const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { experience, coverLetter } = req.body;

    // Check job exists and is open
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.status === 'closed')
      return res.status(400).json({ message: 'This job vacancy is closed' });

    // Check deadline
    if (job.deadline && new Date() > new Date(job.deadline)) {
      return res.status(400).json({ message: 'Application deadline has passed' });
    }

    // Prevent duplicate application
    const alreadyApplied = await Application.findOne({
      jobId,
      barberId: req.user._id,
    });
    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Resume must be uploaded via multer
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload your resume (PDF)' });
    }

    // Upload resume to Cloudinary (raw for PDFs)
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'salon_app/resumes',
      resource_type: 'raw',
      use_filename: true,
    });

    // Remove local temp file
    fs.unlinkSync(req.file.path);

    const application = await Application.create({
      jobId,
      barberId: req.user._id,
      resume: {
        url: result.secure_url,
        publicId: result.public_id,
        originalName: req.file.originalname,
      },
      experience: Number(experience),
      coverLetter,
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (error) {
    // Clean up temp file on error
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Track my application statuses
// @route   GET /api/applications/my
// @access  Private/Barber
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ barberId: req.user._id })
      .populate({
        path: 'jobId',
        select: 'title status salary location jobType deadline',
        populate: { path: 'salon', select: 'name city images' },
      })
      .sort('-createdAt');

    res.status(200).json({ count: applications.length, data: applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single application (barber can view own)
// @route   GET /api/applications/:id
// @access  Private
export const getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('jobId', 'title salary location jobType')
      .populate('barberId', 'name email phone');

    if (!application) return res.status(404).json({ message: 'Application not found' });

    const isApplicant = application.barberId._id.toString() === req.user._id.toString();
    if (!isApplicant && req.user.role !== 'owner' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── OWNER — Manage Applications ─────────────────────────────────────────────

// @desc    Get all applications for a job (owner)
// @route   GET /api/applications/job/:jobId
// @access  Private/Owner, Admin
export const getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Verify owner
    if (
      job.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to view these applications' });
    }

    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('barberId', 'name email phone profileImage')
      .sort('-createdAt');

    res.status(200).json({ count: applications.length, data: applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update application status (owner reviews, shortlists, hires, rejects)
// @route   PATCH /api/applications/:id/status
// @access  Private/Owner, Admin
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, ownerNotes } = req.body;

    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const application = await Application.findById(req.params.id).populate('jobId');
    if (!application) return res.status(404).json({ message: 'Application not found' });

    // Verify owner of the job
    if (
      application.jobId.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    if (ownerNotes) application.ownerNotes = ownerNotes;
    await application.save();

    res.status(200).json({
      message: `Application marked as ${status}`,
      data: application,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Withdraw application (barber)
// @route   DELETE /api/applications/:id
// @access  Private/Barber
export const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (application.barberId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to withdraw this application' });
    }

    if (['hired', 'rejected'].includes(application.status)) {
      return res.status(400).json({ message: `Cannot withdraw a ${application.status} application` });
    }

    // Delete resume from Cloudinary
    if (application.resume?.publicId) {
      await cloudinary.uploader.destroy(application.resume.publicId, {
        resource_type: 'raw',
      });
    }

    await Application.findByIdAndDelete(req.params.id);

    // Decrement job totalApplications
    await Job.findByIdAndUpdate(application.jobId, { $inc: { totalApplications: -1 } });

    res.status(200).json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
