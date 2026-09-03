import express from 'express';
import { getStaffDashboard, updateAppointmentStatus } from '../controllers/staffController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All staff routes require at least 'barber' role
router.use(protect);
router.use(authorize('barber', 'owner', 'admin'));

router.get('/dashboard', getStaffDashboard);
router.patch('/appointments/:id/status', updateAppointmentStatus);

export default router;
