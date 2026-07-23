import express from 'express';
import {
  applyForJob,
  getMyApplications,
  getApplication,
  getJobApplications,
  updateApplicationStatus,
  withdrawApplication,
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { uploadResume } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// ─── Barber routes ─────────────────────────────────────────────────────────────
// Apply for a job (with PDF resume upload)
router.post('/:jobId/apply', protect, authorize('barber'), uploadResume.single('resume'), applyForJob);

// Track my applications
router.get('/my', protect, authorize('barber'), getMyApplications);

// Withdraw an application
router.delete('/:id', protect, authorize('barber'), withdrawApplication);

// ─── Shared routes ─────────────────────────────────────────────────────────────
// Get single application (barber can see own; owner can see for their job)
router.get('/:id', protect, getApplication);

// ─── Owner routes ──────────────────────────────────────────────────────────────
// Get all applications for a specific job
router.get('/job/:jobId', protect, authorize('owner', 'admin'), getJobApplications);

// Update application status (reviewed / shortlisted / hired / rejected)
router.patch('/:id/status', protect, authorize('owner', 'admin'), updateApplicationStatus);

export default router;
