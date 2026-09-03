import express from 'express';
import { getLoyaltyTransactions } from '../controllers/loyaltyController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/transactions', protect, getLoyaltyTransactions);

export default router;
