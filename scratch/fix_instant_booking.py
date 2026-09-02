import re

with open('backend/controllers/appointmentController.js', 'r', encoding='utf-8') as f:
    content = f.read()

new_controller = """import { getAvailableSlots } from '../services/availabilityService.js';
import moment from 'moment-timezone';
import Chair from '../models/Chair.js';

// @desc    Create an instant booking (Phase 6)
// @route   POST /api/appointments/instant
// @access  Private
export const createInstantBooking = async (req, res) => {
  const session = await mongoose.startSession();
  let useTransaction = true;
  
  try {
    // Some local MongoDB setups don't support transactions without replica sets.
    session.startTransaction();
  } catch (err) {
    useTransaction = false;
  }

  try {
    const { shopId, serviceId, date, startTime, barberId } = req.body;
    
    if (!shopId || !serviceId || !date || !startTime) {
      throw new Error('Missing required booking parameters');
    }

    const salon = useTransaction ? await Salon.findById(shopId).session(session) : await Salon.findById(shopId);
    if (!salon) throw new Error('Shop not found');

    const service = salon.services.find(s => s._id.toString() === serviceId);
    if (!service) throw new Error('Service not found in this shop');
    if (service.isActive === false) throw new Error('This service is no longer available');

    // Calculate Price and snapshot
    let finalPrice = service.price;
    let discountApplied = null;
    if (salon.activeOffer && salon.activeOffer.isActive) {
       discountApplied = salon.activeOffer.title;
       if (salon.activeOffer.discountValue && salon.activeOffer.discountValue.includes('%')) {
          const pct = parseInt(salon.activeOffer.discountValue);
          finalPrice = finalPrice - (finalPrice * pct / 100);
       }
    }

    // Availability Re-check
    const slots = await getAvailableSlots(shopId, date, service, 'Asia/Kolkata');
    const targetSlot = slots.find(s => s.startTime === startTime);
    
    if (!targetSlot) {
      throw new Error('The selected slot is no longer available.');
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

    // Chair assignment
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

    // Double check barber conflict strictly (just in case availabilityService missed something or concurrency)
    const overlappingBarberApptQuery = Appointment.findOne({
          salon: shopId,
          barber: assignedBarberId,
          status: { $in: ['pending', 'confirmed'] },
          startTime: { $lt: eTime.toDate() },
          endTime: { $gt: sTime.toDate() }
    });
    const overlappingBarberAppt = useTransaction ? await overlappingBarberApptQuery.session(session) : await overlappingBarberApptQuery;
    if (overlappingBarberAppt) {
        throw new Error('This slot was just taken. Please choose another available time.');
    }

    if (moment().tz('Asia/Kolkata').isAfter(sTime)) {
       throw new Error('Cannot book a past time slot.');
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
      status: 'confirmed', // Instant booking marks as confirmed right away
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

# Let's cleanly inject it.
if "createInstantBooking" not in content:
    start_str = "export const createAppointment"
    content = content.replace(start_str, new_controller + "\n" + start_str)
    with open('backend/controllers/appointmentController.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added createInstantBooking safely.")
else:
    print("Already added.")

