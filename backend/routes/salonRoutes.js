import express from 'express';
import {
  getSalons,
  getSalon,
  createSalon,
  updateSalon,
  deleteSalon,
  getNearbySalons,
  getShopAvailability,
} from '../controllers/salonController.js';
import { protect, authorize, optionalAuth } from '../middlewares/authMiddleware.js';
import reviewRoutes from './reviewRoutes.js';

const router = express.Router();

// Re-route into other resource routers
router.use('/:salonId/reviews', reviewRoutes);

router.get('/nearby', optionalAuth, getNearbySalons);
router.get('/:id/availability', getShopAvailability);

router
  .route('/')
  .get(getSalons)
  .post(protect, createSalon);

router
  .route('/:id')
  .get(getSalon)
  .put(protect, authorize('owner', 'admin'), updateSalon)
  .delete(protect, authorize('owner', 'admin'), deleteSalon);

export default router;
