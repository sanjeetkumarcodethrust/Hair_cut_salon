import express from 'express';
import {
  toggleFavorite,
  getFavorites,
  recordView,
  getRecentlyViewed,
  getRecommendedSalons,
  clearRecentlyViewed
} from '../controllers/customerPreferenceController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/favorites/toggle', protect, toggleFavorite);
router.get('/favorites', protect, getFavorites);

router.post('/recent', protect, recordView);
router.get('/recent', protect, getRecentlyViewed);
router.delete('/recent', protect, clearRecentlyViewed);

router.get('/recommended', protect, getRecommendedSalons);

export default router;
