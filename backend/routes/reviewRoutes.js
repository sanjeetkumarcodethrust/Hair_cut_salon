import express from 'express';
import {
  addReview,
  updateReview,
  deleteReview,
  getSalonReviews,
  getBarberReviews,
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Standalone review routes
router.post('/', protect, authorize('customer'), addReview);
router.put('/:id', protect, authorize('customer'), updateReview);
router.delete('/:id', protect, deleteReview);

// Nested (re-routed from salons/barbers)
router.get('/salon/:salonId', getSalonReviews);
router.get('/barber/:barberId', getBarberReviews);

export default router;
