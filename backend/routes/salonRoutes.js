import express from 'express';
import {
  getSalons,
  getSalon,
  createSalon,
  updateSalon,
  deleteSalon,
} from '../controllers/salonController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import reviewRoutes from './reviewRoutes.js';

const router = express.Router();

// Re-route into other resource routers
router.use('/:salonId/reviews', reviewRoutes);

router
  .route('/')
  .get(getSalons)
  .post(protect, authorize('SalonOwner', 'Admin'), createSalon);

router
  .route('/:id')
  .get(getSalon)
  .put(protect, authorize('SalonOwner', 'Admin'), updateSalon)
  .delete(protect, authorize('SalonOwner', 'Admin'), deleteSalon);

export default router;
