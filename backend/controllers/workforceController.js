import AttendanceRecord from '../models/AttendanceRecord.js';
import LeaveRequest from '../models/LeaveRequest.js';
import BarberProfile from '../models/BarberProfile.js';
import moment from 'moment-timezone';

// --- ATTENDANCE ---

// @desc    Check In
// @route   POST /api/workforce/check-in
// @access  Private (barber)
export const checkIn = async (req, res) => {
    try {
        const timezone = req.query.timezone || 'Asia/Kolkata';
        const barberProfile = await BarberProfile.findOne({ user: req.user._id });
        if (!barberProfile) return res.status(404).json({ success: false, message: 'Barber profile not found' });

        const now = moment().tz(timezone);
        const dateString = now.format('YYYY-MM-DD');

        const existing = await AttendanceRecord.findOne({ staffId: barberProfile._id, dateString });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Already checked in today' });
        }

        const attendance = new AttendanceRecord({
            staffId: barberProfile._id,
            shopId: barberProfile.salonId,
            dateString,
            checkIn: now.toDate(),
            status: 'Present' // A more advanced system would check shift start time to mark 'Late'
        });

        await attendance.save();
        res.status(201).json({ success: true, message: 'Checked in successfully', attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Check Out
// @route   POST /api/workforce/check-out
// @access  Private (barber)
export const checkOut = async (req, res) => {
    try {
        const timezone = req.query.timezone || 'Asia/Kolkata';
        const barberProfile = await BarberProfile.findOne({ user: req.user._id });
        if (!barberProfile) return res.status(404).json({ success: false, message: 'Barber profile not found' });

        const now = moment().tz(timezone);
        const dateString = now.format('YYYY-MM-DD');

        const attendance = await AttendanceRecord.findOne({ staffId: barberProfile._id, dateString });
        if (!attendance) {
            return res.status(400).json({ success: false, message: 'No check-in found for today' });
        }
        if (attendance.checkOut) {
            return res.status(400).json({ success: false, message: 'Already checked out today' });
        }

        attendance.checkOut = now.toDate();
        await attendance.save();

        res.status(200).json({ success: true, message: 'Checked out successfully', attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Today's Attendance
// @route   GET /api/workforce/attendance/today
// @access  Private (barber)
export const getTodayAttendance = async (req, res) => {
    try {
        const timezone = req.query.timezone || 'Asia/Kolkata';
        const barberProfile = await BarberProfile.findOne({ user: req.user._id });
        if (!barberProfile) return res.status(404).json({ success: false, message: 'Barber profile not found' });

        const dateString = moment().tz(timezone).format('YYYY-MM-DD');
        const attendance = await AttendanceRecord.findOne({ staffId: barberProfile._id, dateString });

        res.status(200).json({ success: true, attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- LEAVE MANAGEMENT ---

// @desc    Request Leave
// @route   POST /api/workforce/leave
// @access  Private (barber)
export const requestLeave = async (req, res) => {
    try {
        const { leaveType, startDate, endDate, reason } = req.body;
        if (!startDate || !endDate) return res.status(400).json({ success: false, message: 'Dates are required' });

        const barberProfile = await BarberProfile.findOne({ user: req.user._id });
        if (!barberProfile) return res.status(404).json({ success: false, message: 'Barber profile not found' });

        // Overlap detection
        const overlap = await LeaveRequest.findOne({
            staffId: barberProfile._id,
            status: { $in: ['PENDING', 'APPROVED'] },
            $or: [
                { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
            ]
        });

        if (overlap) {
            return res.status(400).json({ success: false, message: 'Leave request overlaps with an existing request' });
        }

        const leave = new LeaveRequest({
            staffId: barberProfile._id,
            shopId: barberProfile.salonId,
            leaveType,
            startDate,
            endDate,
            reason
        });

        await leave.save();
        res.status(201).json({ success: true, message: 'Leave request submitted', leave });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Shop Leave Requests
// @route   GET /api/workforce/leave/shop/:shopId
// @access  Private (owner, admin)
export const getShopLeaveRequests = async (req, res) => {
    try {
        const { shopId } = req.params;
        const leaves = await LeaveRequest.find({ shopId })
            .populate('staffId', 'name profilePhoto')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, leaves });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Respond to Leave Request
// @route   PATCH /api/workforce/leave/:id/respond
// @access  Private (owner, admin)
export const respondToLeave = async (req, res) => {
    try {
        const { status } = req.body; // 'APPROVED' or 'REJECTED'
        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const leave = await LeaveRequest.findById(req.params.id);
        if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });

        leave.status = status;
        leave.approvedBy = req.user._id;
        leave.approvedAt = new Date();
        await leave.save();

        res.status(200).json({ success: true, message: `Leave ${status.toLowerCase()}`, leave });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
