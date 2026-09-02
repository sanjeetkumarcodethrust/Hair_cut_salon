import express from 'express';
import {
  registerDeviceToken,
  getVapidKey,
  getMyNotifications,
  markAsRead
} from '../controllers/notificationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/vapid-key', getVapidKey);
router.post('/register', protect, registerDeviceToken);
router.get('/', protect, getMyNotifications);
router.put('/read', protect, markAsRead);

export default router;
