import express from 'express';
import { getOwnerOverview, getOwnerServices, getAdminPlatformOverview } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import Salon from '../models/Salon.js';

const router = express.Router();

// Middleware to ensure the user is the owner of the shop they are querying
const isShopOwner = async (req, res, next) => {
  try {
    const salon = await Salon.findById(req.params.shopId);
    if (!salon) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }
    
    // Admin can access any shop's analytics
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      return next();
    }
    
    const isOwner = salon.owner.toString() === req.user._id.toString();
    const isManager = req.user.role === 'manager' && req.user.managedBranches && req.user.managedBranches.includes(salon._id.toString());
    
    if (!isOwner && !isManager) {
      return res.status(403).json({ success: false, message: 'Not authorized for this shop\'s analytics' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

router.get('/shop/:shopId/overview', protect, isShopOwner, getOwnerOverview);
router.get('/shop/:shopId/services', protect, isShopOwner, getOwnerServices);
router.get('/admin/platform', protect, authorize('admin', 'superadmin'), getAdminPlatformOverview);

export default router;
