import Business from '../models/Business.js';
import Salon from '../models/Salon.js';
import Appointment from '../models/Appointment.js';

// @desc    Get owner's business and branches
// @route   GET /api/business/me
// @access  Private (Owner/Manager)
export const getMyBusiness = async (req, res) => {
  try {
    let business;
    let branches;

    if (req.user.role === 'owner') {
      business = await Business.findOne({ owner: req.user._id });
      
      if (!business) {
        // Fallback or handle cases where migration hasn't run
        // But the startup migration should handle it.
        return res.status(404).json({ success: false, message: 'Business not found' });
      }

      branches = await Salon.find({ business: business._id }).populate('owner', 'name email');
    } else if (req.user.role === 'manager') {
      branches = await Salon.find({ _id: { $in: req.user.managedBranches } });
      if (branches.length > 0) {
        business = await Business.findById(branches[0].business);
      }
    }

    res.json({
      success: true,
      business,
      branches: branches || []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get consolidated business analytics
// @route   GET /api/business/:id/analytics
// @access  Private (Owner)
export const getBusinessAnalytics = async (req, res) => {
  try {
    const businessId = req.params.id;
    const business = await Business.findById(businessId);
    
    if (!business || business.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this business' });
    }

    const branches = await Salon.find({ business: businessId }).select('_id');
    const branchIds = branches.map(b => b._id);

    const pipeline = [
      { $match: { salon: { $in: branchIds } } },
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
          netRevenue: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$status', 'completed'] }, { $eq: ['$paymentStatus', 'paid'] }] },
                '$price',
                0
              ]
            }
          }
        }
      }
    ];

    const results = await Appointment.aggregate(pipeline);
    
    const stats = results[0] || {
      totalBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      noShowBookings: 0,
      netRevenue: 0
    };
    
    stats.avgBookingValue = stats.completedBookings > 0 
      ? Math.round(stats.netRevenue / stats.completedBookings) 
      : 0;

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
