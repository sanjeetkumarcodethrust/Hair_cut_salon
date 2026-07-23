import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { getDashboardOverview } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/overview', protect, getDashboardOverview);

export default router;
