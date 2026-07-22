import express from 'express';
import {
  getBarberProfiles,
  getBarberProfile,
  createOrUpdateBarberProfile,
} from '../controllers/barberProfileController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(getBarberProfiles)
  .post(protect, authorize('Barber'), createOrUpdateBarberProfile);

router
  .route('/:id')
  .get(getBarberProfile);

export default router;
