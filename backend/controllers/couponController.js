import mongoose from 'mongoose';
import Coupon from '../models/Coupon.js';
import Salon from '../models/Salon.js';
import Appointment from '../models/Appointment.js';
import moment from 'moment-timezone';

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private (Owner/Admin)
export const createCoupon = async (req, res) => {
  try {
    const { salonId, code, discountType, discountValue, maxDiscount, minOrderValue, applicableServices, expiresAt, usageLimit, perCustomerLimit } = req.body;

    const salon = await Salon.findById(salonId);
    if (!salon) return res.status(404).json({ message: 'Salon not found' });

    if (req.user.role === 'owner' && salon.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to create coupons for this shop' });
    }

    const normalizedCode = code.toUpperCase().trim();
    const existing = await Coupon.findOne({ salon: salonId, code: normalizedCode });
    if (existing) return res.status(400).json({ message: 'Coupon code already exists for this shop' });

    const coupon = await Coupon.create({
      salon: salonId,
      code: normalizedCode,
      discountType,
      discountValue,
      maxDiscount,
      minOrderValue,
      applicableServices,
      expiresAt,
      usageLimit,
      perCustomerLimit,
      status: 'active'
    });

    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get coupons for a shop (Owner)
// @route   GET /api/coupons/shop/:salonId
export const getShopCoupons = async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.salonId);
    if (!salon) return res.status(404).json({ message: 'Salon not found' });

    if (req.user.role === 'owner' && salon.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const coupons = await Coupon.find({ salon: req.params.salonId }).sort({ createdAt: -1 });
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

    const salon = await Salon.findById(coupon.salon);
    if (req.user.role === 'owner' && salon.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { status, expiresAt, usageLimit, maxDiscount, minOrderValue } = req.body;
    
    if (status) coupon.status = status;
    if (expiresAt !== undefined) coupon.expiresAt = expiresAt;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount;
    if (minOrderValue !== undefined) coupon.minOrderValue = minOrderValue;

    await coupon.save();
    res.status(200).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Validate a coupon code (Customer)
// @route   POST /api/coupons/validate
export const validateCoupon = async (req, res) => {
  try {
    const { code, salonId, serviceId, amount } = req.body;
    
    if (!code || !salonId || !serviceId || amount == null) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    const normalizedCode = code.toUpperCase().trim();
    const coupon = await Coupon.findOne({ salon: salonId, code: normalizedCode });

    if (!coupon) return res.status(404).json({ message: 'Invalid coupon code' });

    // Validation Rules
    if (coupon.status !== 'active') return res.status(400).json({ message: `Coupon is ${coupon.status}` });
    
    if (coupon.startAt && new Date() < new Date(coupon.startAt)) {
      return res.status(400).json({ message: 'Coupon is not yet active' });
    }

    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
      coupon.status = 'expired';
      await coupon.save();
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      coupon.status = 'exhausted';
      await coupon.save();
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    if (coupon.minOrderValue && amount < coupon.minOrderValue) {
      return res.status(400).json({ message: `Minimum booking value of ₹${coupon.minOrderValue} required` });
    }

    if (coupon.applicableServices && coupon.applicableServices.length > 0) {
      const isApplicable = coupon.applicableServices.some(s => s.toString() === serviceId.toString());
      if (!isApplicable) {
        return res.status(400).json({ message: 'Coupon is not valid for this service' });
      }
    }

    // Per Customer Limit Check
    if (coupon.perCustomerLimit) {
       const userUsage = await Appointment.countDocuments({
         customer: req.user._id,
         couponId: coupon._id,
         status: { $nin: ['cancelled', 'pending'] } // Assuming successful payment or confirmed
       });
       if (userUsage >= coupon.perCustomerLimit) {
         return res.status(400).json({ message: 'You have reached the maximum usage limit for this coupon' });
       }
    }

    // Calculate Discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (amount * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === 'fixed') {
      discountAmount = coupon.discountValue;
    }

    if (discountAmount > amount) {
      discountAmount = amount; // Never discount more than total
    }

    const finalPrice = amount - discountAmount;

    res.status(200).json({
      valid: true,
      originalPrice: amount,
      discountAmount,
      finalPrice,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
