import re

with open('backend/controllers/appointmentController.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the createInstantBooking with one that auto-finds the next slot if missing
new_instant = """// @desc    Create an instant booking (Phase 6)
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
        finalPrice
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
        finalPrice
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

# Extract everything before createInstantBooking, replace it, then append createScheduledBooking
start_instant = content.find('export const createInstantBooking')
# Let's cleanly replace
import re
# We'll just replace the whole file from the export const createInstantBooking onwards, since it's at the end.
content = content[:content.rfind('// @desc    Create an instant booking (Phase 6)')] + new_instant + "\n\n" + new_scheduled

with open('backend/controllers/appointmentController.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated appointmentController.js with scheduled and instant booking APIs.")

# Update routes
with open('backend/routes/appointmentRoutes.js', 'r', encoding='utf-8') as f:
    routes = f.read()

if "createScheduledBooking" not in routes:
    routes = routes.replace("createInstantBooking,", "createInstantBooking,\n  createScheduledBooking,")
    routes = routes.replace("router.post('/instant', protect, createInstantBooking);", "router.post('/instant', protect, createInstantBooking);\nrouter.post('/scheduled', protect, createScheduledBooking);")
    with open('backend/routes/appointmentRoutes.js', 'w', encoding='utf-8') as f:
        f.write(routes)
    print("Updated appointmentRoutes.js")
