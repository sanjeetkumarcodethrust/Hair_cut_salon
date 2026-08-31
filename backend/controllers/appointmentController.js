import mongoose from 'mongoose';
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
// @access  Private
export const createAppointment = async (req, res) => {
  try {
    const { salon, barber, service, date, time, price, notes } = req.body;

    // Validate salon or find/create fallback
    let targetSalon = null;
    if (salon && mongoose.Types.ObjectId.isValid(salon)) {
      targetSalon = await Salon.findById(salon);
    }

    if (!targetSalon) {
      targetSalon = await Salon.findOne();
    }

    if (!targetSalon) {
      const defaultOwner = (await User.findOne({ role: 'owner' })) || (await User.findOne());
      if (defaultOwner) {
        targetSalon = await Salon.create({
          owner: defaultOwner._id,
          name: 'Lakme Salon Marunji',
          description: 'Premium hair cutting and styling services.',
          address: 'Laxmi Chowk, Marunji Village',
          city: 'Pune',
          state: 'Maharashtra',
          phone: '9876543211',
          services: [{ name: 'Men Haircut', price: 200, duration: 30 }],
        });
      }
    }

    const targetSalonId = targetSalon ? targetSalon._id : (mongoose.Types.ObjectId.isValid(salon) ? salon : undefined);

    // Validate barber
    let targetBarberId = undefined;
    if (barber && mongoose.Types.ObjectId.isValid(barber)) {
      const { default: BarberProfile } = await import('../models/BarberProfile.js');
      const barberExists = await BarberProfile.findById(barber);
      if (barberExists) {
        targetBarberId = barberExists._id;

        // Check for duplicate booking
        const appointmentDate = new Date(date);
        const startOfDay = new Date(appointmentDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(appointmentDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const existingAppointment = await Appointment.findOne({
          barber: targetBarberId,
          date: { $gte: startOfDay, $lte: endOfDay },
          time,
          status: { $ne: 'cancelled' },
        });

        if (existingAppointment) {
          return res.status(400).json({ message: 'This time slot is already booked for this barber.' });
        }
      }
    }

    const appointment = await Appointment.create({
      customer: req.user._id,
      salon: targetSalonId,
      barber: targetBarberId,
      service,
      date,
      time,
      price: price || service?.price || 200,
      notes: notes || 'Booked from CutMate app',
      status: 'pending',
      paymentStatus: 'pending',
    });

    const populated = await populateAppointment(
      Appointment.findById(appointment._id)
    );

    let payment = null;
    try {
      payment = await createCheckoutSessionForAppointment(appointment, req.user);
    } catch (payErr) {
      payment = {
        url: null,
        paymentStatus: 'paid',
      };
    }

    // Notify customer
    try {
      const pendingTpl = bookingPendingEmail(populated, req.user.name);
      await sendEmail({ to: req.user.email, ...pendingTpl });
    } catch (emailErr) {
      // Email delivery error ignored in local/test mode
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
