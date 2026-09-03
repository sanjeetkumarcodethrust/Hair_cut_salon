import Appointment from '../models/Appointment.js';
import Salon from '../models/Salon.js';
import BarberProfile from '../models/BarberProfile.js';
import moment from 'moment-timezone';

const calculateWaitTime = async (shopId, timezone) => {
    const todayStart = moment().tz(timezone).startOf('day').toDate();
    const todayEnd = moment().tz(timezone).endOf('day').toDate();

    const activeApts = await Appointment.find({
        salon: shopId,
        status: { $in: ['in_progress', 'arrived'] },
        createdAt: { $gte: todayStart, $lte: todayEnd }
    }).sort({ updatedAt: 1 }).lean();

    const inProgress = activeApts.filter(a => a.status === 'in_progress');
    const waiting = activeApts.filter(a => a.status === 'arrived');

    const totalWaitingDuration = waiting.reduce((acc, a) => acc + (a.totalDuration || a.service?.duration || 30), 0);
    const totalInProgressDuration = inProgress.reduce((acc, a) => acc + (a.totalDuration || a.service?.duration || 30), 0);
    
    // Very simplified assumption: divide total workload by number of active barbers.
    const activeBarbersCount = await BarberProfile.countDocuments({ salonId: shopId, status: 'active' });
    const effectiveBarbers = Math.max(1, activeBarbersCount);
    
    // Remaining time of in progress is roughly half of their total duration on average (naive approximation for now)
    const estimatedRemainingInProgress = totalInProgressDuration / 2;
    
    const estimatedWaitMin = Math.round((estimatedRemainingInProgress + totalWaitingDuration) / effectiveBarbers);
    
    return {
        waitingCount: waiting.length,
        inProgressCount: inProgress.length,
        estimatedWaitMin
    };
};

// @desc    Get live shop queue status
// @route   GET /api/queue/shop/:shopId
// @access  Public
export const getShopQueueStatus = async (req, res) => {
    try {
        const { shopId } = req.params;
        const timezone = req.query.timezone || 'Asia/Kolkata';

        const salon = await Salon.findById(shopId).select('name walkInsEnabled maxQueueSize');
        if (!salon) return res.status(404).json({ success: false, message: 'Shop not found' });

        const stats = await calculateWaitTime(shopId, timezone);

        res.status(200).json({
            success: true,
            walkInsEnabled: salon.walkInsEnabled,
            isFull: stats.waitingCount >= salon.maxQueueSize,
            ...stats
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Join walk-in queue
// @route   POST /api/queue/join
// @access  Private (customer)
export const joinQueue = async (req, res) => {
    try {
        const { shopId, serviceIds } = req.body;
        const timezone = req.query.timezone || 'Asia/Kolkata';

        if (!shopId || !serviceIds || serviceIds.length === 0) {
            return res.status(400).json({ success: false, message: 'Missing parameters' });
        }

        const salon = await Salon.findById(shopId);
        if (!salon) return res.status(404).json({ success: false, message: 'Shop not found' });

        if (salon.walkInsEnabled === false) {
            return res.status(400).json({ success: false, message: 'Walk-ins are temporarily paused' });
        }

        const stats = await calculateWaitTime(shopId, timezone);
        if (stats.waitingCount >= salon.maxQueueSize) {
            return res.status(400).json({ success: false, message: 'Queue is currently full' });
        }
        
        // Ensure customer isn't already in the queue
        const existing = await Appointment.findOne({
            customer: req.user._id,
            salon: shopId,
            status: { $in: ['arrived', 'in_progress'] },
            createdAt: { $gte: moment().tz(timezone).startOf('day').toDate() }
        });
        
        if (existing) {
             return res.status(400).json({ success: false, message: 'You are already in the active queue' });
        }

        const selectedServices = [];
        let basePrice = 0;
        let totalDuration = 0;

        for (const sid of serviceIds) {
            const s = salon.services.find(srv => srv._id.toString() === sid);
            if (!s) return res.status(400).json({ success: false, message: `Service ${sid} not found` });
            selectedServices.push(s);
            basePrice += s.price;
            totalDuration += (s.duration || 30);
        }

        const now = moment().tz(timezone);

        const newAppointment = new Appointment({
            customer: req.user._id,
            salon: shopId,
            bookingType: 'walk_in',
            status: 'arrived', // immediately waiting in queue
            date: now.toDate(),
            time: now.format('HH:mm'),
            serviceId: selectedServices[0]._id, // legacy fallback
            services: selectedServices.map(s => ({
                serviceId: s._id,
                name: s.name,
                price: s.price,
                duration: s.duration
            })),
            totalDuration: totalDuration,
            service: {
                name: selectedServices.map(s => s.name).join(' + '),
                price: basePrice,
                duration: totalDuration,
            },
            price: basePrice
        });

        await newAppointment.save();

        res.status(201).json({
            success: true,
            message: 'Successfully joined the queue',
            appointment: newAppointment
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get customer's queue position
// @route   GET /api/queue/position/:id
// @access  Private (customer)
export const getQueuePosition = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const timezone = req.query.timezone || 'Asia/Kolkata';

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) return res.status(404).json({ success: false, message: 'Queue entry not found' });
        
        if (appointment.customer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (appointment.status !== 'arrived') {
            return res.status(200).json({ success: true, status: appointment.status, position: 0, estimatedWaitMin: 0 });
        }

        // Count how many 'arrived' people have an older updatedAt than this customer
        const position = await Appointment.countDocuments({
            salon: appointment.salon,
            status: 'arrived',
            createdAt: { $gte: moment().tz(timezone).startOf('day').toDate() },
            updatedAt: { $lt: appointment.updatedAt }
        });

        const stats = await calculateWaitTime(appointment.salon, timezone);

        res.status(200).json({
            success: true,
            status: appointment.status,
            position: position + 1, // 1-indexed
            estimatedWaitMin: stats.estimatedWaitMin
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Leave queue
// @route   DELETE /api/queue/leave/:id
// @access  Private (customer)
export const leaveQueue = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) return res.status(404).json({ success: false, message: 'Queue entry not found' });
        
        if (appointment.customer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (appointment.status !== 'arrived') {
            return res.status(400).json({ success: false, message: 'Cannot leave queue now' });
        }

        appointment.status = 'cancelled';
        appointment.cancellationReason = 'Left queue manually';
        await appointment.save();

        res.status(200).json({ success: true, message: 'Successfully left the queue' });
    } catch (error) {
         res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Toggle walk-ins
// @route   PATCH /api/queue/shop/:shopId/toggle
// @access  Private (owner, admin)
export const toggleWalkIns = async (req, res) => {
    try {
        const { shopId } = req.params;
        const { walkInsEnabled } = req.body;

        const salon = await Salon.findById(shopId);
        if (!salon) return res.status(404).json({ success: false, message: 'Shop not found' });

        if (salon.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        salon.walkInsEnabled = walkInsEnabled;
        await salon.save();

        res.status(200).json({ success: true, walkInsEnabled: salon.walkInsEnabled });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
