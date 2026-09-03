import express from 'express';
import {
  createReview,
  getSalonReviews,
  getMyReviews,
  editReview,
  deleteReview,
  reportReview
} from '../controllers/reviewController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createReview);

router.route('/my')
  .get(protect, getMyReviews);

router.route('/salon/:id')
  .get(getSalonReviews);

router.route('/:id')
  .put(protect, editReview)
  .delete(protect, deleteReview);

router.route('/:id/report')
  .post(protect, reportReview);

export default router;
