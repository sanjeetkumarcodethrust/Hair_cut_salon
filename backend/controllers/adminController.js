import mongoose from 'mongoose';
import User from '../models/User.js';
import Salon from '../models/Salon.js';
import Appointment from '../models/Appointment.js';
import Review from '../models/Review.js';
import AuditLog from '../models/AuditLog.js';

// Helper for audit logging
const logAdminAction = async (adminId, action, targetType, targetId, reason = '', previousState = {}, newState = {}) => {
  await AuditLog.create({
    admin: adminId,
    action,
    targetType,
    targetId,
    reason,
    previousState,
    newState
  });
};

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalOwners = await User.countDocuments({ role: 'owner' });
    const totalShops = await Salon.countDocuments();
    const verifiedShops = await Salon.countDocuments({ verificationStatus: 'approved' });
    const pendingShops = await Salon.countDocuments({ verificationStatus: 'pending' });
    const totalBookings = await Appointment.countDocuments();
    const completedBookings = await Appointment.countDocuments({ status: 'completed' });
    
    // Total Payments
    const revenueAggr = await Appointment.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: { $ifNull: ["$advanceAmount", "$price"] } } } }
    ]);
    const totalRevenue = revenueAggr.length > 0 ? revenueAggr[0].totalRevenue : 0;

    res.status(200).json({
      totalUsers,
      totalOwners,
      totalShops,
      verifiedShops,
      pendingShops,
      totalBookings,
      completedBookings,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (customers/owners)
// @route   GET /api/admin/users
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.role) query.role = req.query.role;
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await User.countDocuments(query);

    res.status(200).json({ users, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Suspend or Reactivate User
// @route   PUT /api/admin/users/:id/status
export const updateUserStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot modify admin status' });
    }

    const previousStatus = user.status;
    user.status = status;
    if (reason) user.suspensionReason = reason;
    await user.save();

    await logAdminAction(req.user._id, `Change User Status to ${status}`, 'User', user._id, reason, { status: previousStatus }, { status: user.status });

    res.status(200).json({ message: `User ${status} successfully`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all shops
// @route   GET /api/admin/shops
export const getShops = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.verificationStatus) query.verificationStatus = req.query.verificationStatus;
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }

    const shops = await Salon.find(query).populate('owner', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Salon.countDocuments(query);

    res.status(200).json({ shops, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Shop Verification Status
// @route   PUT /api/admin/shops/:id/verification
export const updateShopVerification = async (req, res) => {
  try {
    const { status, reason } = req.body;
    
    if (!['pending', 'approved', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const shop = await Salon.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    const previousStatus = shop.verificationStatus;
    shop.verificationStatus = status;
    if (status === 'rejected') shop.rejectionReason = reason;
    if (status === 'suspended') shop.suspensionReason = reason;

    await shop.save();

    await logAdminAction(req.user._id, `Change Shop Verification to ${status}`, 'Salon', shop._id, reason, { status: previousStatus }, { status: shop.verificationStatus });

    res.status(200).json({ message: `Shop ${status} successfully`, shop });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
export const getBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const bookings = await Appointment.find({})
      .populate('customer', 'name email')
      .populate('salon', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Appointment.countDocuments();

    res.status(200).json({ bookings, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Audit Logs
// @route   GET /api/admin/audit-logs
export const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find({})
      .populate('admin', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await AuditLog.countDocuments();

    res.status(200).json({ logs, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get all reviews (for moderation)
// @route   GET /api/admin/reviews
export const getAdminReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status; // 'published', 'hidden', 'reported'

    const reviews = await Review.find(query)
      .populate('customer', 'name email')
      .populate('salon', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Review.countDocuments(query);

    res.status(200).json({ reviews, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Moderate Review
// @route   PUT /api/admin/reviews/:id/moderate
export const moderateReview = async (req, res) => {
  try {
    const { status, reason } = req.body;
    if (!['published', 'hidden', 'reported'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const previousStatus = review.status;
    review.status = status;
    await review.save();

    // Recalculate aggregates if it was hidden or published
    const { updateSalonRating, updateBarberRating } = await import('./reviewController.js');
    await updateSalonRating(review.salon);
    await updateBarberRating(review.barber);

    await logAdminAction(req.user._id, `Moderate Review to ${status}`, 'Review', review._id, reason, { status: previousStatus }, { status: review.status });

    res.status(200).json({ message: `Review ${status} successfully`, review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get all coupons
// @route   GET /api/admin/coupons
export const getAdminCoupons = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const Coupon = (await import('../models/Coupon.js')).default;
    const coupons = await Coupon.find({})
      .populate('salon', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Coupon.countDocuments();

    res.status(200).json({ coupons, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
