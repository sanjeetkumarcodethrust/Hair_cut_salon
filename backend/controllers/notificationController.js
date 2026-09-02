import DeviceToken from '../models/DeviceToken.js';
import Notification from '../models/Notification.js';
import { getPublicKey } from '../services/notificationService.js';

// @desc    Register a new device token
// @route   POST /api/notifications/register
// @access  Private
export const registerDeviceToken = async (req, res) => {
  try {
    const { endpoint, keys, platform } = req.body;
    if (!endpoint || !keys) {
      return res.status(400).json({ message: 'Missing push subscription parameters' });
    }

    const tokenString = endpoint; // use endpoint as unique token

    let deviceToken = await DeviceToken.findOne({ token: tokenString });
    
    if (deviceToken) {
      // If token belongs to someone else (e.g. user switch on same browser), update userId
      deviceToken.userId = req.user._id;
      deviceToken.active = true;
      deviceToken.lastSeenAt = new Date();
      deviceToken.keys = keys;
      deviceToken.platform = platform || 'web';
      await deviceToken.save();
    } else {
      deviceToken = await DeviceToken.create({
        userId: req.user._id,
        token: tokenString,
        endpoint,
        keys,
        platform: platform || 'web',
        active: true
      });
    }

    res.status(200).json({ success: true, message: 'Device registered for push notifications' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get VAPID Public Key
// @route   GET /api/notifications/vapid-key
// @access  Public
export const getVapidKey = (req, res) => {
  res.status(200).json({ publicKey: getPublicKey() });
};

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json({ data: notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notifications as read
// @route   PUT /api/notifications/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    await Notification.updateMany(
      { _id: { $in: notificationIds }, userId: req.user._id },
      { $set: { readAt: new Date() } }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
