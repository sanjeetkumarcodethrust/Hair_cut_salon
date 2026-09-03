import express from 'express';
import { 
    checkIn, checkOut, getTodayAttendance, 
    requestLeave, getShopLeaveRequests, respondToLeave 
} from '../controllers/workforceController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Barber routes
router.post('/check-in', protect, authorize('barber', 'owner', 'admin'), checkIn);
router.post('/check-out', protect, authorize('barber', 'owner', 'admin'), checkOut);
router.get('/attendance/today', protect, authorize('barber', 'owner', 'admin'), getTodayAttendance);
router.post('/leave', protect, authorize('barber', 'owner', 'admin'), requestLeave);

// Owner routes
router.get('/leave/shop/:shopId', protect, authorize('owner', 'admin'), getShopLeaveRequests);
router.patch('/leave/:id/respond', protect, authorize('owner', 'admin'), respondToLeave);

export default router;
