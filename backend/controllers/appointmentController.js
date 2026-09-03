import mongoose from 'mongoose';
import moment from 'moment-timezone';
import Chair from '../models/Chair.js';
import { getAvailableSlots } from '../services/availabilityService.js';
import { emitBookingConfirmed, emitBookingRescheduled, emitBookingCancelled } from '../services/bookingEventEmitter.js';


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

    // Ownership verification for customers
    if (req.user.role === 'customer') {
       if (appointment.customer?._id?.toString() !== req.user._id.toString() && appointment.customer?.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: 'You are not authorized to view this booking' });
       }
    } else if (req.user.role === 'owner') {
       // Owners can only view bookings for their salons
       const salons = await Salon.find({ owner: req.user._id }).lean();
       const salonIds = salons.map(s => s._id.toString());
       if (!salonIds.includes(appointment.salon?._id?.toString() && appointment.salon?.toString())) {
          // It's possible the populated salon object has _id
          const aptSalonId = appointment.salon?._id ? appointment.salon._id.toString() : appointment.salon?.toString();
          if (!salonIds.includes(aptSalonId)) {
             return res.status(403).json({ message: 'Not authorized to view this booking' });
          }
       }
    } else if (req.user.role === 'barber') {
       const aptBarberId = appointment.barber?._id ? appointment.barber._id.toString() : appointment.barber?.toString();
       if (aptBarberId !== req.user._id.toString()) {
          return res.status(403).json({ message: 'Not authorized to view this booking' });
       }
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

    // Ownership Check
    const isCustomer = appointment.customer.toString() === req.user._id.toString();
    const isPrivileged = ['owner', 'admin'].includes(req.user.role);

    if (!isCustomer && !isPrivileged) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }

    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({ message: `Cannot cancel a ${appointment.status} appointment` });
    }

    // Cancellation Policy Check (e.g. 30 minutes before)
    if (appointment.startTime && !isPrivileged) {
       const now = moment().tz('Asia/Kolkata');
       const aptStart = moment(appointment.startTime).tz('Asia/Kolkata');
       const diffMins = aptStart.diff(now, 'minutes');
       if (diffMins < 30) {
          return res.status(400).json({ message: 'Cancellations are not permitted less than 30 minutes before the appointment.' });
       }
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = req.body.reason || '';
    
    // Maintain audit trail
    if (!appointment.snapshots) appointment.snapshots = {};
    appointment.snapshots.cancelledAt = new Date();
    
    await appointment.save();

    const populated = await populateAppointment(Appointment.findById(appointment._id));

    // Notify customer
    const customer = await User.findById(appointment.customer);
    if (customer?.email) {
      const tpl = bookingCancelledEmail(populated, customer.name);
      sendEmail({ to: customer.email, ...tpl }).catch(err => console.error("Email error:", err));
    }

    // Notify owner
    const salon = await Salon.findById(appointment.salon).populate('owner');
    if (salon?.owner?.email) {
      const ownerTpl = bookingCancelledEmail(populated, salon.owner.name);
      sendEmail({ to: salon.owner.email, ...ownerTpl }).catch(err => console.error("Email error:", err));
    }

    const shopCancel = await Salon.findById(appointment.salon);
    if (shopCancel) emitBookingCancelled(appointment, shopCancel);
    res.status(200).json({ success: true, message: 'Appointment cancelled', data: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Reschedule Appointment ───────────────────────────────────────────────────

// @desc    Reschedule an appointment
// @route   PUT /api/appointments/:id/reschedule
// @access  Private/Customer, Owner, Admin
export const rescheduleAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  let useTransaction = true;
  try {
    session.startTransaction();
  } catch (err) {
    useTransaction = false;
  }

  try {
    const { rescheduleDate, rescheduleTime, barberId } = req.body;

    if (!rescheduleDate || !rescheduleTime) {
      throw new Error('Please provide rescheduleDate and rescheduleTime');
    }

    const appointment = useTransaction ? await Appointment.findById(req.params.id).session(session) : await Appointment.findById(req.params.id);
    if (!appointment) throw new Error('Appointment not found');

    const isCustomer = appointment.customer.toString() === req.user._id.toString();
    const isPrivileged = ['owner', 'admin'].includes(req.user.role);

    if (!isCustomer && !isPrivileged) {
      throw new Error('Not authorized to reschedule this appointment');
    }

    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      throw new Error(`Cannot reschedule a ${appointment.status} appointment`);
    }

    const reqDate = moment.tz(rescheduleDate, 'Asia/Kolkata');
    const maxDate = moment().tz('Asia/Kolkata').add(30, 'days');
    if (reqDate.isAfter(maxDate)) {
      throw new Error('Cannot schedule more than 30 days in advance.');
    }

    const shopId = appointment.salon;
    const salon = useTransaction ? await Salon.findById(shopId).session(session) : await Salon.findById(shopId);
    if (!salon) throw new Error('Shop not found');
    
    const authoritativeDuration = appointment.snapshots?.serviceDuration || appointment.service?.duration || 30;
    
    const serviceObj = { 
        name: appointment.service?.name || appointment.snapshots?.serviceName || 'Service', 
        duration: authoritativeDuration 
    };
    
    const slots = await getAvailableSlots(shopId, rescheduleDate, serviceObj, 'Asia/Kolkata', appointment._id);
    const targetSlot = slots.find(s => s.startTime === rescheduleTime);
    
    if (!targetSlot) {
       throw new Error('This time is no longer available. Please choose another time.');
    }
    
    const sTime = moment.tz(`${rescheduleDate}T${rescheduleTime}:00`, 'Asia/Kolkata');
    const eTime = moment.tz(`${rescheduleDate}T${rescheduleTime}:00`, 'Asia/Kolkata').add(authoritativeDuration, 'minutes');
    
    if (moment().tz('Asia/Kolkata').isAfter(sTime)) {
       throw new Error('Cannot reschedule to a past time slot.');
    }

    let targetBarberId = barberId || appointment.barber;
    if (!targetBarberId) {
      targetBarberId = targetSlot?.availableBarbers?.[0];
    }

    const overlappingBarberApptQuery = Appointment.findOne({
          salon: shopId,
          barber: targetBarberId,
          _id: { $ne: appointment._id }, // EXCLUDE original appointment
          status: { $in: ['pending', 'confirmed'] },
          startTime: { $lt: eTime.toDate() },
          endTime: { $gt: sTime.toDate() }
    });
    const overlappingBarberAppt = useTransaction ? await overlappingBarberApptQuery.session(session) : await overlappingBarberApptQuery;
    
    if (overlappingBarberAppt) {
        throw new Error('This slot is no longer available. Please select another time.');
    }
    
    const chairsQuery = Chair.find({ shopId, status: 'available', active: true });
    const chairs = useTransaction ? await chairsQuery.session(session) : await chairsQuery;
    let assignedChairId = appointment.chair;
    
    if (chairs.length > 0) {
       const overlappingQuery = Appointment.find({
          salon: shopId,
          _id: { $ne: appointment._id },
          status: { $in: ['pending', 'confirmed'] },
          startTime: { $lt: eTime.toDate() },
          endTime: { $gt: sTime.toDate() }
       });
       const overlappingAppts = useTransaction ? await overlappingQuery.session(session) : await overlappingQuery;
       
       const busyChairIds = overlappingAppts.map(a => a.chair?.toString()).filter(Boolean);
       const freeChair = chairs.find(c => !busyChairIds.includes(c._id.toString()));
       
       if (!freeChair) {
          throw new Error('No physical chairs available.');
       }
       assignedChairId = freeChair._id;
    }

    if (!appointment.snapshots) appointment.snapshots = {};
    appointment.snapshots.rescheduledAt = new Date();
    appointment.snapshots.originalDate = appointment.date;
    appointment.snapshots.originalTime = appointment.time;

    appointment.date = new Date(rescheduleDate);
    appointment.time = rescheduleTime;
    appointment.startTime = sTime.toDate();
    appointment.endTime = eTime.toDate();
    appointment.barber = targetBarberId;
    appointment.chair = assignedChairId;
    appointment.status = 'confirmed'; // Keep it confirmed
    
    await appointment.save(useTransaction ? { session } : undefined);

    if (useTransaction) {
        await session.commitTransaction();
    }
    session.endSession();
    
    const populated = await populateAppointment(Appointment.findById(appointment._id));

    const customer = await User.findById(appointment.customer);
    if (customer?.email) {
      const tpl = bookingRescheduledEmail(populated, customer.name);
      sendEmail({ to: customer.email, ...tpl }).catch(e => console.log(e));
    }

    emitBookingRescheduled(appointment, salon);
    res.status(200).json({ success: true, message: 'Appointment rescheduled successfully', data: populated });
  } catch (error) {
    if (useTransaction && session.inTransaction()) {
        await session.abortTransaction();
    }
    session.endSession();
    res.status(400).json({ success: false, message: error.message });
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
    
    // Loyalty Reward Logic
    const pointsEarned = Math.floor(appointment.price / 10); // 1 point per ₹10
    appointment.loyaltyPointsEarned = pointsEarned;
    await appointment.save();

    const User = (await import('../models/User.js')).default;
    const LoyaltyTransaction = (await import('../models/LoyaltyTransaction.js')).default;
    
    const customer = await User.findByIdAndUpdate(
      appointment.customer, 
      { $inc: { loyaltyPoints: pointsEarned } }, 
      { new: true }
    );
    
    if (customer) {
      await LoyaltyTransaction.create({
        user: customer._id,
        type: 'earned',
        points: pointsEarned,
        referenceId: appointment._id,
        description: `Points earned for booking ${appointment._id.toString().substring(0,6)}`,
        balanceAfter: customer.loyaltyPoints
      });
      
      // Check Referral Bonus (if this is the first completed booking)
      const completedCount = await Appointment.countDocuments({ customer: customer._id, status: 'completed' });
      if (completedCount === 1 && customer.referredBy) {
         const referralBonus = 500; // 500 points for successful referral
         const referrer = await User.findByIdAndUpdate(
           customer.referredBy,
           { $inc: { loyaltyPoints: referralBonus } },
           { new: true }
         );
         if (referrer) {
           await LoyaltyTransaction.create({
             user: referrer._id,
             type: 'referral_bonus',
             points: referralBonus,
             referenceId: customer._id,
             description: `Bonus for referring ${customer.name}`,
             balanceAfter: referrer.loyaltyPoints
           });
         }
      }
    }


    const populated = await populateAppointment(Appointment.findById(appointment._id));
    res.status(200).json({ message: 'Appointment completed', data: populated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create an instant booking (Phase 6/7)
// @route   POST /api/appointments/instant
// @access  Private
export const createInstantBooking = async (req, res) => {
  const session = await mongoose.startSession();
  let useTransaction = true;
  try {
    session.startTransaction();
  } catch (err) {
    useTransaction = false;
  }

  try {
    const serviceIds = req.body.serviceIds || (req.body.serviceId ? [req.body.serviceId] : []);
    if (!req.body.shopId || serviceIds.length === 0) {
      throw new Error('Missing required booking parameters');
    }
    const shopId = req.body.shopId;
    
    const salon = useTransaction ? await Salon.findById(shopId).session(session) : await Salon.findById(shopId);
    if (!salon) throw new Error('Shop not found');
    
    const selectedServices = [];
    let basePrice = 0;
    let totalDuration = 0;
    
    for (const sid of serviceIds) {
       const s = salon.services.find(srv => srv._id.toString() === sid);
       if (!s) throw new Error(`Service ${sid} not found in this shop`);
       if (s.isActive === false) throw new Error(`Service ${s.name} is no longer available`);
       selectedServices.push(s);
       basePrice += s.price;
       totalDuration += (s.duration || 30);
    }
    
    const service = {
       _id: selectedServices[0]._id, 
       name: selectedServices.map(s => s.name).join(' + '),
       price: basePrice,
       duration: totalDuration,
       rawList: selectedServices
    };

    
    let finalPrice = service.price;
    let originalPrice = service.price;
    let discountApplied = null;
    let discountAmount = 0;
    let couponId = null;

    if (req.body.couponCode) {
      const Coupon = (await import('../models/Coupon.js')).default;
      const coupon = await Coupon.findOne({ salon: shopId, code: req.body.couponCode.toUpperCase().trim() });
      if (!coupon) throw new Error('Invalid coupon code');
      if (coupon.status !== 'active') throw new Error(`Coupon is ${coupon.status}`);
      if (coupon.startAt && new Date() < new Date(coupon.startAt)) throw new Error('Coupon is not yet active');
      if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
        coupon.status = 'expired'; await coupon.save(); throw new Error('Coupon has expired');
      }
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        coupon.status = 'exhausted'; await coupon.save(); throw new Error('Coupon usage limit reached');
      }
      if (coupon.minOrderValue && finalPrice < coupon.minOrderValue) throw new Error(`Minimum booking value of ₹${coupon.minOrderValue} required`);
      
      if (coupon.perCustomerLimit) {
         const userUsage = await Appointment.countDocuments({
           customer: req.user._id,
           couponId: coupon._id,
           status: { $nin: ['cancelled', 'pending'] }
         });
         if (userUsage >= coupon.perCustomerLimit) throw new Error('You have reached the maximum usage limit for this coupon');
      }

      if (coupon.discountType === 'percentage') {
        discountAmount = (finalPrice * coupon.discountValue) / 100;
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) discountAmount = coupon.maxDiscount;
      } else {
        discountAmount = coupon.discountValue;
      }
      if (discountAmount > finalPrice) discountAmount = finalPrice;
      
      finalPrice = finalPrice - discountAmount;
      discountApplied = coupon.code;
      couponId = coupon._id;
      
      // Atomically increment usage
      await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usageCount: 1 } });
    } else if (salon.activeOffer && salon.activeOffer.isActive) {
       discountApplied = salon.activeOffer.title;
       if (salon.activeOffer.discountValue && salon.activeOffer.discountValue.includes('%')) {
          const pct = parseInt(salon.activeOffer.discountValue);
          discountAmount = (finalPrice * pct / 100);
          finalPrice = finalPrice - discountAmount;
       }
    }


    // Auto-find earliest slot starting from today
    const todayStr = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
    const slots = await getAvailableSlots(shopId, todayStr, service, 'Asia/Kolkata');
    
    if (!slots || slots.length === 0) {
      throw new Error('No availability right now. Try scheduling a later time.');
    }

    const targetSlot = slots[0]; // Earliest available slot today
    const date = todayStr;
    const startTime = targetSlot.startTime;

    const assignedBarberId = targetSlot.availableBarbers[0];

    const chairsQuery = Chair.find({ shopId, status: 'available', active: true });
    const chairs = useTransaction ? await chairsQuery.session(session) : await chairsQuery;
    
    let assignedChairId = null;
    const sTime = moment.tz(`${date}T${startTime}:00`, 'Asia/Kolkata');
    const eTime = moment.tz(`${date}T${targetSlot.endTime}:00`, 'Asia/Kolkata');

    if (chairs.length > 0) {
       const overlappingQuery = Appointment.find({
          salon: shopId,
          status: { $in: ['pending', 'confirmed'] },
          startTime: { $lt: eTime.toDate() },
          endTime: { $gt: sTime.toDate() }
       });
       const overlappingAppts = useTransaction ? await overlappingQuery.session(session) : await overlappingQuery;
       
       const busyChairIds = overlappingAppts.map(a => a.chair?.toString()).filter(Boolean);
       const freeChair = chairs.find(c => !busyChairIds.includes(c._id.toString()));
       
       if (!freeChair) {
          throw new Error('No physical chairs available.');
       }
       assignedChairId = freeChair._id;
    }

    const apptData = {
      customer: req.user._id,
      salon: shopId,
      barber: assignedBarberId,
      chair: assignedChairId,
      serviceId: service._id,
      service: {
        name: service.name,
        price: service.price,
        duration: service.duration
      },
      date: new Date(date),
      time: startTime,
      startTime: sTime.toDate(),
      endTime: eTime.toDate(),

      originalPrice,
      discountAmount,
      couponCode: discountApplied,
      couponId,

        loyaltyDiscountAmount,
        pointsRedeemed,
        price: finalPrice,
      status: 'confirmed',
      bookingType: 'instant',
      snapshots: {
        serviceName: service.name,
        originalPrice: service.price,
        discountApplied,
        finalPrice,
        serviceDuration: service.duration
      }
    };

    let appointment;
    if (useTransaction) {
        appointment = await Appointment.create([apptData], { session });
        await session.commitTransaction();
    } else {
        appointment = [await Appointment.create(apptData)];
    }
    
    session.endSession();

    emitBookingConfirmed(appointment[0], salon);
    res.status(201).json({
      success: true,
      message: 'Booking Confirmed',
      data: appointment[0]
    });
  } catch (error) {
    if (useTransaction && session.inTransaction()) {
        await session.abortTransaction();
    }
    session.endSession();
    res.status(400).json({ success: false, message: error.message });
  }
};


// @desc    Create a scheduled booking (Phase 7)
// @route   POST /api/appointments/scheduled
// @access  Private
export const createScheduledBooking = async (req, res) => {
  const session = await mongoose.startSession();
  let useTransaction = true;
  try {
    session.startTransaction();
  } catch (err) {
    useTransaction = false;
  }

  try {
    const serviceIds = req.body.serviceIds || (req.body.serviceId ? [req.body.serviceId] : []);
    const { date, startTime, barberId } = req.body;
    if (!req.body.shopId || serviceIds.length === 0 || !date || !startTime) {
      throw new Error('Missing required scheduling parameters');
    }
    const shopId = req.body.shopId;
    
    const salon = useTransaction ? await Salon.findById(shopId).session(session) : await Salon.findById(shopId);
    if (!salon) throw new Error('Shop not found');
    
    const selectedServices = [];
    let basePrice = 0;
    let totalDuration = 0;
    
    for (const sid of serviceIds) {
       const s = salon.services.find(srv => srv._id.toString() === sid);
       if (!s) throw new Error(`Service ${sid} not found in this shop`);
       if (s.isActive === false) throw new Error(`Service ${s.name} is no longer available`);
       selectedServices.push(s);
       basePrice += s.price;
       totalDuration += (s.duration || 30);
    }
    
    const service = {
       _id: selectedServices[0]._id,
       name: selectedServices.map(s => s.name).join(' + '),
       price: basePrice,
       duration: totalDuration,
       rawList: selectedServices
    };

    
    let finalPrice = service.price;
    let originalPrice = service.price;
    let discountApplied = null;
    let discountAmount = 0;
    let couponId = null;

    if (req.body.couponCode) {
      const Coupon = (await import('../models/Coupon.js')).default;
      const coupon = await Coupon.findOne({ salon: shopId, code: req.body.couponCode.toUpperCase().trim() });
      if (!coupon) throw new Error('Invalid coupon code');
      if (coupon.status !== 'active') throw new Error(`Coupon is ${coupon.status}`);
      if (coupon.startAt && new Date() < new Date(coupon.startAt)) throw new Error('Coupon is not yet active');
      if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
        coupon.status = 'expired'; await coupon.save(); throw new Error('Coupon has expired');
      }
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        coupon.status = 'exhausted'; await coupon.save(); throw new Error('Coupon usage limit reached');
      }
      if (coupon.minOrderValue && finalPrice < coupon.minOrderValue) throw new Error(`Minimum booking value of ₹${coupon.minOrderValue} required`);
      
      if (coupon.perCustomerLimit) {
         const userUsage = await Appointment.countDocuments({
           customer: req.user._id,
           couponId: coupon._id,
           status: { $nin: ['cancelled', 'pending'] }
         });
         if (userUsage >= coupon.perCustomerLimit) throw new Error('You have reached the maximum usage limit for this coupon');
      }

      if (coupon.discountType === 'percentage') {
        discountAmount = (finalPrice * coupon.discountValue) / 100;
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) discountAmount = coupon.maxDiscount;
      } else {
        discountAmount = coupon.discountValue;
      }
      if (discountAmount > finalPrice) discountAmount = finalPrice;
      
      finalPrice = finalPrice - discountAmount;
      discountApplied = coupon.code;
      couponId = coupon._id;
      
      // Atomically increment usage
      await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usageCount: 1 } });
    } else if (salon.activeOffer && salon.activeOffer.isActive) {
       discountApplied = salon.activeOffer.title;
       if (salon.activeOffer.discountValue && salon.activeOffer.discountValue.includes('%')) {
          const pct = parseInt(salon.activeOffer.discountValue);
          discountAmount = (finalPrice * pct / 100);
          finalPrice = finalPrice - discountAmount;
       }
    }


    const slots = await getAvailableSlots(shopId, date, service.rawList, 'Asia/Kolkata');
    const targetSlot = slots.find(s => s.startTime === startTime);
    
    if (!targetSlot) {
      throw new Error('This time is no longer available. Please choose another time.');
    }

    let assignedBarberId = null;
    if (barberId) {
       if (!targetSlot.availableBarbers.includes(barberId)) {
          throw new Error('The selected barber is no longer available.');
       }
       assignedBarberId = barberId;
    } else {
       if (targetSlot.availableBarbers.length === 0) {
          throw new Error('No barbers available for this slot.');
       }
       assignedBarberId = targetSlot.availableBarbers[0];
    }

    const chairsQuery = Chair.find({ shopId, status: 'available', active: true });
    const chairs = useTransaction ? await chairsQuery.session(session) : await chairsQuery;
    
    let assignedChairId = null;
    const sTime = moment.tz(`${date}T${startTime}:00`, 'Asia/Kolkata');
    const eTime = moment.tz(`${date}T${targetSlot.endTime}:00`, 'Asia/Kolkata');

    if (chairs.length > 0) {
       const overlappingQuery = Appointment.find({
          salon: shopId,
          status: { $in: ['pending', 'confirmed'] },
          startTime: { $lt: eTime.toDate() },
          endTime: { $gt: sTime.toDate() }
       });
       const overlappingAppts = useTransaction ? await overlappingQuery.session(session) : await overlappingQuery;
       
       const busyChairIds = overlappingAppts.map(a => a.chair?.toString()).filter(Boolean);
       const freeChair = chairs.find(c => !busyChairIds.includes(c._id.toString()));
       
       if (!freeChair) {
          throw new Error('No physical chairs available.');
       }
       assignedChairId = freeChair._id;
    }

    const overlappingBarberApptQuery = Appointment.findOne({
          salon: shopId,
          barber: assignedBarberId,
          status: { $in: ['pending', 'confirmed'] },
          startTime: { $lt: eTime.toDate() },
          endTime: { $gt: sTime.toDate() }
    });
    const overlappingBarberAppt = useTransaction ? await overlappingBarberApptQuery.session(session) : await overlappingBarberApptQuery;
    if (overlappingBarberAppt) {
        throw new Error('This time was just booked. Please choose another time.');
    }

    if (moment().tz('Asia/Kolkata').isAfter(sTime)) {
       throw new Error('Cannot schedule a past time slot.');
    }

    const apptData = {
      customer: req.user._id,
      salon: shopId,
      barber: assignedBarberId,
      chair: assignedChairId,
      serviceId: service._id,
      service: {
        name: service.name,
        price: service.price,
        duration: service.duration
      },
      date: new Date(date),
      time: startTime,
      startTime: sTime.toDate(),
      endTime: eTime.toDate(),

      originalPrice,
      discountAmount,
      couponCode: discountApplied,
      couponId,

        loyaltyDiscountAmount,
        pointsRedeemed,
        price: finalPrice,
      status: 'confirmed',
      bookingType: 'scheduled',
      snapshots: {
        serviceName: service.name,
        originalPrice: service.price,
        discountApplied,
        finalPrice,
        serviceDuration: service.duration
      }
    };

    let appointment;
    if (useTransaction) {
        appointment = await Appointment.create([apptData], { session });
        await session.commitTransaction();
    } else {
        appointment = [await Appointment.create(apptData)];
    }
    
    session.endSession();

    emitBookingConfirmed(appointment[0], salon);
    res.status(201).json({
      success: true,
      message: 'Booking Scheduled',
      data: appointment[0]
    });
  } catch (error) {
    if (useTransaction && session.inTransaction()) {
        await session.abortTransaction();
    }
    session.endSession();
    res.status(400).json({ success: false, message: error.message });
  }
};
