import express from 'express';
import {
  createCoupon,
  getShopCoupons,
  updateCoupon,
  validateCoupon
} from '../controllers/couponController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('owner', 'admin'), createCoupon);
router.get('/shop/:salonId', protect, authorize('owner', 'admin'), getShopCoupons);
router.put('/:id', protect, authorize('owner', 'admin'), updateCoupon);
router.post('/validate', protect, validateCoupon);

export default router;
