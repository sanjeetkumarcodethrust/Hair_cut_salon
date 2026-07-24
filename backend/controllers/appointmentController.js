import Appointment from '../models/Appointment.js';
import Salon from '../models/Salon.js';
import User from '../models/User.js';
import {
  sendEmail,
  bookingPendingEmail,
  bookingConfirmedEmail,
  bookingCancelledEmail,
  bookingRescheduledEmail,
  ownerNewBookingEmail,
} from '../utils/sendEmail.js';
import { createCheckoutSessionForAppointment } from './paymentController.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const populateAppointment = (query) =>
  query
    .populate('customer', 'name email phone')
    .populate('barber', 'name profilePhoto')
    .populate('salon', 'name address city phone email');

// ─── Book Appointment ─────────────────────────────────────────────────────────

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private/Customer
export const createAppointment = async (req, res) => {
  try {
    const { salon, barber, service, date, time, price, notes } = req.body;

    const appointment = await Appointment.create({
      customer: req.user._id,
      salon,
      barber,
      service,
      date,
      time,
      price,
      notes,
      status: 'pending',
      paymentStatus: 'pending',
    });

    const populated = await populateAppointment(
      Appointment.findById(appointment._id)
    );

    const payment = await createCheckoutSessionForAppointment(appointment, req.user);

    // Notify customer
    const pendingTpl = bookingPendingEmail(populated, req.user.name);
    await sendEmail({ to: req.user.email, ...pendingTpl });

    // Notify salon owner
    const salonDoc = await Salon.findById(salon).populate('owner', 'name email');
    if (salonDoc?.owner?.email) {
      const ownerTpl = ownerNewBookingEmail(populated, salonDoc.owner.name);
      await sendEmail({ to: salonDoc.owner.email, ...ownerTpl });
    }

    res.status(201).json({ appointment: populated, payment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ─── Get Appointments ─────────────────────────────────────────────────────────

// @desc    Get logged-in user's appointments
// @route   GET /api/appointments/my
// @access  Private
export const getMyAppointments = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'customer') {
      query = { customer: req.user._id };
    } else if (req.user.role === 'barber') {
      query = { barber: req.user._id };
    } else if (req.user.role === 'owner') {
      const salons = await Salon.find({ owner: req.user._id });
      const salonIds = salons.map((s) => s._id);
      query = { salon: { $in: salonIds } };
    }
    // admin: empty query → all appointments

    const appointments = await populateAppointment(Appointment.find(query).sort({ date: -1 }));
    res.status(200).json({ count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointment = async (req, res) => {
  try {
    const appointment = await populateAppointment(
      Appointment.findById(req.params.id)
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Owner Approval ───────────────────────────────────────────────────────────

// @desc    Owner confirms or rejects an appointment
// @route   PUT /api/appointments/:id/approve
// @access  Private/Owner, Admin
export const approveAppointment = async (req, res) => {
  try {
    const { status } = req.body; // 'confirmed' or 'cancelled'

    if (!['confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Status must be confirmed or cancelled' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // Verify ownership
    const salon = await Salon.findById(appointment.salon);
    if (
      salon.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    appointment.status = status;
    await appointment.save();

    const populated = await populateAppointment(Appointment.findById(appointment._id));

    // Send customer notification
    const customer = await User.findById(appointment.customer);
    if (customer?.email) {
      const tpl =
        status === 'confirmed'
          ? bookingConfirmedEmail(populated, customer.name)
          : bookingCancelledEmail(populated, customer.name, 'Rejected by salon owner');
      await sendEmail({ to: customer.email, ...tpl });
    }

    res.status(200).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ─── Cancel Appointment ───────────────────────────────────────────────────────

// @desc    Cancel an appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // Only the customer who booked or owner/admin can cancel
    const isCustomer = appointment.customer.toString() === req.user._id.toString();
    const isPrivileged = ['owner', 'admin'].includes(req.user.role);

    if (!isCustomer && !isPrivileged) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel a completed appointment' });
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = req.body.reason || '';
    await appointment.save();

    const populated = await populateAppointment(Appointment.findById(appointment._id));

    // Notify customer
    const customer = await User.findById(appointment.customer);
    if (customer?.email) {
      const tpl = bookingCancelledEmail(populated, customer.name, appointment.cancellationReason);
      await sendEmail({ to: customer.email, ...tpl });
    }

    res.status(200).json({ message: 'Appointment cancelled', data: populated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ─── Reschedule Appointment ───────────────────────────────────────────────────

// @desc    Reschedule an appointment
// @route   PUT /api/appointments/:id/reschedule
// @access  Private/Customer, Owner, Admin
export const rescheduleAppointment = async (req, res) => {
  try {
    const { rescheduleDate, rescheduleTime } = req.body;

    if (!rescheduleDate || !rescheduleTime) {
      return res.status(400).json({ message: 'Please provide rescheduleDate and rescheduleTime' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({ message: `Cannot reschedule a ${appointment.status} appointment` });
    }

    appointment.rescheduleDate = rescheduleDate;
    appointment.rescheduleTime = rescheduleTime;
    appointment.date = rescheduleDate;
    appointment.time = rescheduleTime;
    appointment.status = 'pending'; // Reset to pending — needs re-approval
    await appointment.save();

    const populated = await populateAppointment(Appointment.findById(appointment._id));

    // Notify customer
    const customer = await User.findById(appointment.customer);
    if (customer?.email) {
      const tpl = bookingRescheduledEmail(populated, customer.name);
      await sendEmail({ to: customer.email, ...tpl });
    }

    res.status(200).json({ message: 'Appointment rescheduled', data: populated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ─── Mark Completed ───────────────────────────────────────────────────────────

// @desc    Mark appointment as completed
// @route   PUT /api/appointments/:id/complete
// @access  Private/Barber, Owner, Admin
export const completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (appointment.status !== 'confirmed') {
      return res.status(400).json({ message: 'Only confirmed appointments can be marked as completed' });
    }

    appointment.status = 'completed';
    await appointment.save();

    const populated = await populateAppointment(Appointment.findById(appointment._id));
    res.status(200).json({ message: 'Appointment completed', data: populated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
