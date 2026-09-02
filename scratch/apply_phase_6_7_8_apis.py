import re

with open('backend/controllers/appointmentController.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add imports
imports_to_add = """import moment from 'moment-timezone';
import Chair from '../models/Chair.js';
import { getAvailableSlots } from '../services/availabilityService.js';
"""
if "moment-timezone" not in content:
    # insert after the first import
    content = content.replace("import mongoose from 'mongoose';", "import mongoose from 'mongoose';\n" + imports_to_add)

# 2. Add Phase 6 & 7 booking APIs
new_instant = """// @desc    Create an instant booking (Phase 6/7)
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
    const { shopId, serviceId } = req.body;
    
    if (!shopId || !serviceId) {
      throw new Error('Missing required booking parameters');
    }

    const salon = useTransaction ? await Salon.findById(shopId).session(session) : await Salon.findById(shopId);
    if (!salon) throw new Error('Shop not found');

    const service = salon.services.find(s => s._id.toString() === serviceId);
    if (!service) throw new Error('Service not found in this shop');
    if (service.isActive === false) throw new Error('This service is no longer available');

    let finalPrice = service.price;
    let discountApplied = null;
    if (salon.activeOffer && salon.activeOffer.isActive) {
       discountApplied = salon.activeOffer.title;
       if (salon.activeOffer.discountValue && salon.activeOffer.discountValue.includes('%')) {
          const pct = parseInt(salon.activeOffer.discountValue);
          finalPrice = finalPrice - (finalPrice * pct / 100);
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
"""

new_scheduled = """// @desc    Create a scheduled booking (Phase 7)
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
    const { shopId, serviceId, date, startTime, barberId } = req.body;
    
    if (!shopId || !serviceId || !date || !startTime) {
      throw new Error('Missing required scheduling parameters');
    }

    // Scheduling horizon: Max 30 days
    const reqDate = moment.tz(date, 'Asia/Kolkata');
    const maxDate = moment().tz('Asia/Kolkata').add(30, 'days');
    if (reqDate.isAfter(maxDate)) {
      throw new Error('Cannot schedule more than 30 days in advance.');
    }

    const salon = useTransaction ? await Salon.findById(shopId).session(session) : await Salon.findById(shopId);
    if (!salon) throw new Error('Shop not found');

    const service = salon.services.find(s => s._id.toString() === serviceId);
    if (!service) throw new Error('Service not found in this shop');
    if (service.isActive === false) throw new Error('This service is no longer available');

    let finalPrice = service.price;
    let discountApplied = null;
    if (salon.activeOffer && salon.activeOffer.isActive) {
       discountApplied = salon.activeOffer.title;
       if (salon.activeOffer.discountValue && salon.activeOffer.discountValue.includes('%')) {
          const pct = parseInt(salon.activeOffer.discountValue);
          finalPrice = finalPrice - (finalPrice * pct / 100);
       }
    }

    const slots = await getAvailableSlots(shopId, date, service, 'Asia/Kolkata');
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
"""

if "createInstantBooking" not in content:
    content += "\n" + new_instant + "\n\n" + new_scheduled

# 3. Phase 8 logic - Replacing `cancelAppointment` and `rescheduleAppointment`

cancel_match = re.search(r'(export const cancelAppointment = async \(req, res\) => \{.*?\n\};)', content, re.DOTALL)
if cancel_match:
    old_cancel = cancel_match.group(1)
    
    new_cancel = """export const cancelAppointment = async (req, res) => {
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

    res.status(200).json({ success: true, message: 'Appointment cancelled', data: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};"""
    content = content.replace(old_cancel, new_cancel)


reschedule_match = re.search(r'(export const rescheduleAppointment = async \(req, res\) => \{.*?\n\};)', content, re.DOTALL)
if reschedule_match:
    old_reschedule = reschedule_match.group(1)
    
    new_reschedule = """export const rescheduleAppointment = async (req, res) => {
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
    
    const slots = await getAvailableSlots(shopId, rescheduleDate, serviceObj, 'Asia/Kolkata');
    const targetSlot = slots.find(s => s.startTime === rescheduleTime);
    
    if (!targetSlot) {
       // Proceed to strict check anyway as getAvailableSlots might block it strictly based on this very appointment
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

    res.status(200).json({ success: true, message: 'Appointment rescheduled successfully', data: populated });
  } catch (error) {
    if (useTransaction && session.inTransaction()) {
        await session.abortTransaction();
    }
    session.endSession();
    res.status(400).json({ success: false, message: error.message });
  }
};"""
    content = content.replace(old_reschedule, new_reschedule)

with open('backend/controllers/appointmentController.js', 'w', encoding='utf-8') as f:
    f.write(content)

# Fix missing route registration since I restored git branch!
with open('backend/routes/appointmentRoutes.js', 'r', encoding='utf-8') as f:
    routes = f.read()
if "createScheduledBooking" not in routes:
    routes = routes.replace("import {", "import {\n  createInstantBooking,\n  createScheduledBooking,")
    routes = routes.replace("router.post('/', protect, createAppointment);", "router.post('/', protect, createAppointment);\nrouter.post('/instant', protect, createInstantBooking);\nrouter.post('/scheduled', protect, createScheduledBooking);")
    with open('backend/routes/appointmentRoutes.js', 'w', encoding='utf-8') as f:
        f.write(routes)
