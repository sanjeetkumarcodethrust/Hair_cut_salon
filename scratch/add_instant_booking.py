import re

with open('backend/controllers/appointmentController.js', 'r', encoding='utf-8') as f:
    content = f.read()

new_controller = """import { getAvailableSlots } from '../services/availabilityService.js';
import moment from 'moment-timezone';
import BarberProfile from '../models/BarberProfile.js';
import Chair from '../models/Chair.js';

// @desc    Create an instant booking (Phase 6)
// @route   POST /api/appointments/instant
// @access  Private
export const createInstantBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { shopId, serviceId, date, startTime, barberId } = req.body;
    
    if (!shopId || !serviceId || !date || !startTime) {
      throw new Error('Missing required booking parameters');
    }

    const salon = await Salon.findById(shopId).session(session);
    if (!salon) throw new Error('Shop not found');

    const service = salon.services.find(s => s._id.toString() === serviceId);
    if (!service) throw new Error('Service not found in this shop');
    if (service.isActive === false) throw new Error('This service is no longer available');

    // Calculate Price and snapshot
    let finalPrice = service.price;
    let discountApplied = null;
    if (salon.activeOffer && salon.activeOffer.isActive) {
       // Simple offer logic - just recording it
       discountApplied = salon.activeOffer.title;
       // For a real app, calculate actual discount. We'll just subtract 10% for mock purposes
       // if it has a discountValue like '20%'
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
       // Any Barber mode -> pick first available
       if (targetSlot.availableBarbers.length === 0) {
          throw new Error('No barbers available for this slot.');
       }
       assignedBarberId = targetSlot.availableBarbers[0];
    }

    // Chair assignment (if chairs exist)
    const chairs = await Chair.find({ shopId, status: 'available', active: true }).session(session);
    let assignedChairId = null;
    if (chairs.length > 0) {
       // Need to find an empty chair during this interval
       const sTime = moment.tz(`${date}T${startTime}:00`, 'Asia/Kolkata');
       const eTime = moment.tz(`${date}T${targetSlot.endTime}:00`, 'Asia/Kolkata');
       
       const overlappingAppts = await Appointment.find({
          salon: shopId,
          status: { $in: ['pending', 'confirmed'] },
          startTime: { $lt: eTime.toDate() },
          endTime: { $gt: sTime.toDate() }
       }).session(session);
       
       const busyChairIds = overlappingAppts.map(a => a.chair?.toString()).filter(Boolean);
       const freeChair = chairs.find(c => !busyChairIds.includes(c._id.toString()));
       
       if (!freeChair) {
          throw new Error('No physical chairs available.');
       }
       assignedChairId = freeChair._id;
    }

    const sTimeDate = moment.tz(`${date}T${startTime}:00`, 'Asia/Kolkata').toDate();
    const eTimeDate = moment.tz(`${date}T${targetSlot.endTime}:00`, 'Asia/Kolkata').toDate();

    // Prevent past booking
    if (moment().tz('Asia/Kolkata').isAfter(moment(sTimeDate))) {
       throw new Error('Cannot book a past time slot.');
    }

    const appointment = await Appointment.create([{
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
      startTime: sTimeDate,
      endTime: eTimeDate,
      price: finalPrice,
      status: 'confirmed',
      bookingType: 'instant',
      snapshots: {
        serviceName: service.name,
        originalPrice: service.price,
        discountApplied,
        finalPrice
      }
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: 'Booking Confirmed',
      data: appointment[0]
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    // Catch transaction errors
    if (error.message.includes('Transaction numbers are only allowed on a replica set')) {
       // Fallback for standalone mongo (local testing)
       return res.status(500).json({ success: false, message: 'Transaction failed (needs replica set). Please retry.' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};
"""

# add it after imports
content = content.replace("import { createCheckoutSessionForAppointment } from './paymentController.js';", "import { createCheckoutSessionForAppointment } from './paymentController.js';\n" + new_func)

# Replace 'new_func' with 'new_controller' which I actually defined
content = content.replace("import { createCheckoutSessionForAppointment } from './paymentController.js';\n", "import { createCheckoutSessionForAppointment } from './paymentController.js';\n" + new_controller)


with open('backend/controllers/appointmentController.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added createInstantBooking to appointmentController.js")


with open('backend/routes/appointmentRoutes.js', 'r', encoding='utf-8') as f:
    routes = f.read()

if "createInstantBooking" not in routes:
    routes = routes.replace("createAppointment,", "createAppointment,\n  createInstantBooking,")
    routes = routes.replace("router.post('/', protect, createAppointment);", "router.post('/', protect, createAppointment);\nrouter.post('/instant', protect, createInstantBooking);")
    with open('backend/routes/appointmentRoutes.js', 'w', encoding='utf-8') as f:
        f.write(routes)
    print("Updated appointmentRoutes.js")
