import express from 'express';
import { getShopQueueStatus, joinQueue, getQueuePosition, leaveQueue, toggleWalkIns } from '../controllers/queueController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/shop/:shopId', getShopQueueStatus);

// Customer routes
router.post('/join', protect, joinQueue);
router.get('/position/:id', protect, getQueuePosition);
router.delete('/leave/:id', protect, leaveQueue);

// Owner routes
router.patch('/shop/:shopId/toggle', protect, authorize('owner', 'admin'), toggleWalkIns);

export default router;
