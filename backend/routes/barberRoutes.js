import express from 'express';
import {
  getBarberProfiles,
  getBarberProfile,
  createOrUpdateBarberProfile,
  deleteBarberProfile,
  addToGallery,
  removeFromGallery,
  addToPortfolio,
  removeFromPortfolio,
  addService,
  removeService,
} from '../controllers/barberProfileController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Base routes
router
  .route('/')
  .get(getBarberProfiles)
  .post(protect, authorize('barber', 'admin'), createOrUpdateBarberProfile);

router
  .route('/:id')
  .get(getBarberProfile)
  .put(protect, authorize('barber', 'admin'), createOrUpdateBarberProfile)
  .delete(protect, authorize('barber', 'admin'), deleteBarberProfile);

// Gallery routes
router.post('/:id/gallery', protect, authorize('barber', 'admin'), addToGallery);
router.delete('/:id/gallery/:imageIndex', protect, authorize('barber', 'admin'), removeFromGallery);

// Portfolio routes
router.post('/:id/portfolio', protect, authorize('barber', 'admin'), addToPortfolio);
router.delete('/:id/portfolio/:imageIndex', protect, authorize('barber', 'admin'), removeFromPortfolio);

// Services routes
router.post('/:id/services', protect, authorize('barber', 'admin'), addService);
router.delete('/:id/services/:serviceId', protect, authorize('barber', 'admin'), removeService);

export default router;
