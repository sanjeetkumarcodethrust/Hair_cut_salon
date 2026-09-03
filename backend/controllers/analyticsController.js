import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import Salon from '../models/Salon.js';

// Helper to construct date filters
const getDateMatch = (startDate, endDate) => {
  const match = {};
  if (startDate && endDate) {
    match.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  } else if (startDate) {
    match.date = { $gte: new Date(startDate) };
  } else if (endDate) {
    match.date = { $lte: new Date(endDate) };
  }
  return match;
};

// @desc    Get Shop Overview Analytics
// @route   GET /api/analytics/shop/:shopId/overview
// @access  Private (Owner/Admin)
export const getOwnerOverview = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { startDate, endDate } = req.query;

    const dateMatch = getDateMatch(startDate, endDate);

    const pipeline = [
      { $match: { salon: new mongoose.Types.ObjectId(shopId), ...dateMatch } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          noShowBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'no_show'] }, 1, 0] }
          },
          grossRevenue: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$status', 'completed'] }, { $eq: ['$paymentStatus', 'paid'] }] },
                { $ifNull: ['$originalPrice', '$price'] },
                0
              ]
            }
          },
          netRevenue: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$status', 'completed'] }, { $eq: ['$paymentStatus', 'paid'] }] },
                '$price',
                0
              ]
            }
          },
          totalDiscounts: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$status', 'completed'] }, { $eq: ['$paymentStatus', 'paid'] }] },
                { $add: [{ $ifNull: ['$discountAmount', 0] }, { $ifNull: ['$loyaltyDiscountAmount', 0] }] },
                0
              ]
            }
          }
        }
      }
    ];

    const results = await Appointment.aggregate(pipeline);
    
    // Time Series for Chart (last 7 days by default if no date given, but we just group by date)
    const timeSeriesPipeline = [
      { $match: { salon: new mongoose.Types.ObjectId(shopId), ...dateMatch } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          revenue: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$status', 'completed'] }, { $eq: ['$paymentStatus', 'paid'] }] },
                '$price',
                0
              ]
            }
          },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ];
    const timeSeries = await Appointment.aggregate(timeSeriesPipeline);

    const stats = results[0] || {
      totalBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      noShowBookings: 0,
      grossRevenue: 0,
      netRevenue: 0,
      totalDiscounts: 0
    };

    stats.avgBookingValue = stats.completedBookings > 0 
      ? Math.round(stats.netRevenue / stats.completedBookings) 
      : 0;

    res.json({
      success: true,
      stats,
      timeSeries
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Shop Services Analytics
// @route   GET /api/analytics/shop/:shopId/services
// @access  Private
export const getOwnerServices = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { startDate, endDate } = req.query;
    const dateMatch = getDateMatch(startDate, endDate);

    const pipeline = [
      { $match: { salon: new mongoose.Types.ObjectId(shopId), status: 'completed', ...dateMatch } },
      { $unwind: '$services' },
      {
        $group: {
          _id: '$services.serviceId',
          name: { $first: '$services.name' },
          count: { $sum: 1 },
          revenue: { $sum: '$services.price' } // Approximated gross revenue for that service
        }
      },
      { $sort: { count: -1 } }
    ];

    const services = await Appointment.aggregate(pipeline);

    res.json({
      success: true,
      services
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Admin Platform Analytics
// @route   GET /api/analytics/admin/platform
// @access  Private (Admin only)
export const getAdminPlatformOverview = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalShops = await Salon.countDocuments();
    
    const revenuePipeline = [
      { $match: { status: 'completed', paymentStatus: 'paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$price' },
          totalCompletedBookings: { $sum: 1 }
        }
      }
    ];
    
    const revResults = await Appointment.aggregate(revenuePipeline);
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalShops,
        totalPlatformRevenue: revResults[0]?.totalRevenue || 0,
        totalCompletedBookings: revResults[0]?.totalCompletedBookings || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
