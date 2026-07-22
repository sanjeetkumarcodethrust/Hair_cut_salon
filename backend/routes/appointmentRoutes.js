import express from 'express';
import {
  createAppointment,
  getMyAppointments,
  updateAppointmentStatus,
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(protect, createAppointment); // Customer creates

router
  .route('/myappointments')
  .get(protect, getMyAppointments);

router
  .route('/:id/status')
  .put(protect, updateAppointmentStatus);

export default router;
