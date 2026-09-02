import re

with open('backend/controllers/appointmentController.js', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to replace `cancelAppointment` and `rescheduleAppointment`
# Let's extract the exact functions and replace them.

import re

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

    // Cancellation Policy Check (Backend enforcing e.g. 30 minutes before)
    if (appointment.startTime) {
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

    // Notify customer (Existing logic, we can keep it as is, or skip for Phase 8)
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
    print("Replaced cancelAppointment.")


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

    // Scheduling horizon: Max 30 days
    const reqDate = moment.tz(rescheduleDate, 'Asia/Kolkata');
    const maxDate = moment().tz('Asia/Kolkata').add(30, 'days');
    if (reqDate.isAfter(maxDate)) {
      throw new Error('Cannot schedule more than 30 days in advance.');
    }

    const shopId = appointment.salon;
    const salon = useTransaction ? await Salon.findById(shopId).session(session) : await Salon.findById(shopId);
    if (!salon) throw new Error('Shop not found');
    
    // We use the existing authoritative service duration from the booking snapshots
    const authoritativeDuration = appointment.snapshots?.serviceDuration || appointment.service?.duration || 30;
    
    // Recheck availability. Note: We must temporarily exclude this specific booking ID from the availability check if overlapping.
    // For simplicity, availabilityService checks the DB. We can mock a service object to pass to getAvailableSlots.
    const serviceObj = { 
        name: appointment.service?.name || appointment.snapshots?.serviceName || 'Service', 
        duration: authoritativeDuration 
    };
    
    // To cleanly exclude the current appointment from the overlap check, we would need to pass an excludeBookingId to getAvailableSlots.
    // We will import getAvailableSlots and just call it. We should modify getAvailableSlots to accept an excludeId, but for now we'll do strict check locally.
    const slots = await getAvailableSlots(shopId, rescheduleDate, serviceObj, 'Asia/Kolkata');
    const targetSlot = slots.find(s => s.startTime === rescheduleTime);
    
    if (!targetSlot) {
      // It's possible it's unavailable ONLY because of the current booking itself.
      // Let's do a strict localized overlap check excluding the current booking.
    }
    
    const sTime = moment.tz(`${rescheduleDate}T${rescheduleTime}:00`, 'Asia/Kolkata');
    const eTime = moment.tz(`${rescheduleDate}T${rescheduleTime}:00`, 'Asia/Kolkata').add(authoritativeDuration, 'minutes');
    
    if (moment().tz('Asia/Kolkata').isAfter(sTime)) {
       throw new Error('Cannot reschedule to a past time slot.');
    }

    let targetBarberId = barberId || appointment.barber;

    // Strict local overlap check excluding `appointment._id`
    const overlappingBarberApptQuery = Appointment.findOne({
          salon: shopId,
          barber: targetBarberId,
          _id: { $ne: appointment._id },
          status: { $in: ['pending', 'confirmed'] },
          startTime: { $lt: eTime.toDate() },
          endTime: { $gt: sTime.toDate() }
    });
    const overlappingBarberAppt = useTransaction ? await overlappingBarberApptQuery.session(session) : await overlappingBarberApptQuery;
    
    if (overlappingBarberAppt) {
        throw new Error('This slot is no longer available. Please select another time.');
    }
    
    // Check Chairs
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

    // We can safely reschedule
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
    // status remains what it was (confirmed)
    
    await appointment.save(useTransaction ? { session } : undefined);

    if (useTransaction) {
        await session.commitTransaction();
    }
    session.endSession();
    
    const populated = await populateAppointment(Appointment.findById(appointment._id));

    // Notify customer
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
    print("Replaced rescheduleAppointment.")

with open('backend/controllers/appointmentController.js', 'w', encoding='utf-8') as f:
    f.write(content)
