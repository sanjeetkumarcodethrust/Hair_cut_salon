import express from 'express';
import {
  toggleFavorite,
  getFavoriteSalons,
  getFavoriteBarbers,
  checkFavorite,
} from '../controllers/favoriteController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Toggle favorite (add / remove)
router.post('/toggle', protect, authorize('customer'), toggleFavorite);

// Get favorite salons
router.get('/salons', protect, authorize('customer'), getFavoriteSalons);

// Get favorite barbers
router.get('/barbers', protect, authorize('customer'), getFavoriteBarbers);

// Check if favorited
router.get('/check', protect, authorize('customer'), checkFavorite);

export default router;
