import express from 'express';
import {
  createCheckoutSession,
  confirmPayment,
  refundPayment,
} from '../controllers/paymentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protected endpoints
router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/confirm', protect, confirmPayment);

router.post('/:id/refund', protect, refundPayment);

export default router;
