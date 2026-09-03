import express from 'express';
import { getMyBusiness, getBusinessAnalytics } from '../controllers/businessController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, authorize('owner', 'manager'), getMyBusiness);
router.get('/:id/analytics', protect, authorize('owner'), getBusinessAnalytics);

export default router;
