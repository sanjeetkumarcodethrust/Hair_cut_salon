import express from 'express';
import {
  createJob,
  getMyJobs,
  updateJob,
  deleteJob,
  toggleJobStatus,
  getJobs,
  getJob,
} from '../controllers/jobController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ─── Public routes ─────────────────────────────────────────────────────────────
router.get('/', getJobs);           // Browse all open jobs (with search/filter/pagination)
router.get('/:id', getJob);         // Get single job details

// ─── Owner routes ──────────────────────────────────────────────────────────────
router.post('/', protect, authorize('owner', 'admin'), createJob);
router.get('/owner/my', protect, authorize('owner', 'admin'), getMyJobs);
router.put('/:id', protect, authorize('owner', 'admin'), updateJob);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteJob);
router.patch('/:id/status', protect, authorize('owner', 'admin'), toggleJobStatus);

export default router;
