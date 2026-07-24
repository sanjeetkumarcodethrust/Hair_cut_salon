import express from 'express';
import {
  createAppointment,
  getMyAppointments,
  getAppointment,
  approveAppointment,
  cancelAppointment,
  rescheduleAppointment,
  completeAppointment,
} from '../controllers/appointmentController.js';
import {
  createCheckoutSession,
  confirmPayment,
  getPaymentHistory,
  refundPayment,
} from '../controllers/paymentController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Book appointment (customer)
router.post('/', protect, authorize('customer'), createAppointment);

// Payments
router.post('/checkout', protect, authorize('customer'), createCheckoutSession);
router.post('/payments/confirm', protect, authorize('customer'), confirmPayment);
router.get('/payments/history', protect, authorize('customer'), getPaymentHistory);
router.post('/:id/refund', protect, authorize('customer', 'owner', 'admin'), refundPayment);

// Get my appointments (role-aware)
router.get('/my', protect, getMyAppointments);

// Get single appointment
router.get('/:id', protect, getAppointment);

// Owner approves / rejects (confirms or cancels)
router.put('/:id/approve', protect, authorize('owner', 'admin'), approveAppointment);

// Customer / owner / admin cancels
router.put('/:id/cancel', protect, cancelAppointment);

// Customer / owner / admin reschedules
router.put('/:id/reschedule', protect, rescheduleAppointment);

// Barber / owner marks completed
router.put('/:id/complete', protect, authorize('barber', 'owner', 'admin'), completeAppointment);

export default router;
