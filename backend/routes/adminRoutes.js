import express from 'express';
import {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getShops,
  updateShopVerification,
  getBookings,
  getAuditLogs,
  getAdminReviews,
  moderateReview,
  getAdminCoupons
} from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ALL ROUTES ARE PROTECTED AND RESTRICTED TO ADMIN
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);

// Users
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);

// Shops
router.get('/shops', getShops);
router.put('/shops/:id/verification', updateShopVerification);

// Bookings
router.get('/bookings', getBookings);

// Audit Logs
router.get('/audit-logs', getAuditLogs);

export default router;


// Reviews
router.get('/reviews', getAdminReviews);
router.put('/reviews/:id/moderate', moderateReview);


// Coupons
router.get('/coupons', getAdminCoupons);


// Reviews
router.get('/reviews', getAdminReviews);
router.put('/reviews/:id/moderate', moderateReview);


// Coupons
router.get('/coupons', getAdminCoupons);


// Reviews
router.get('/reviews', getAdminReviews);
router.put('/reviews/:id/moderate', moderateReview);


// Coupons
router.get('/coupons', getAdminCoupons);
