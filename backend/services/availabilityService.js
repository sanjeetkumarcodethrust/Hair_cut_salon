import Salon from '../models/Salon.js';
import BarberProfile from '../models/BarberProfile.js';
import Chair from '../models/Chair.js';
import Appointment from '../models/Appointment.js';
import LeaveRequest from '../models/LeaveRequest.js';
import moment from 'moment-timezone';

const SLOT_INTERVAL = 15; // minutes

export const getAvailableSlots = async (shopId, dateStr, service, timezone = 'Asia/Kolkata', excludeBookingId = null) => {
  // 1. Fetch Shop
  const shop = await Salon.findById(shopId).lean();
  if (!shop) throw new Error('Shop not found');

  const reqDate = moment.tz(dateStr, timezone);
  const dayOfWeek = reqDate.format('dddd').toLowerCase();
  const todayHours = shop.openingHours?.[dayOfWeek];

  // If shop is closed today
  if (!todayHours || todayHours.isClosed) {
    return [];
  }

  // Parse Shop Open/Close times
  // Format is usually "HH:mm" e.g. "10:00", "20:00"
  const shopStart = moment.tz(`${dateStr}T${todayHours.open}:00`, timezone);
  const shopEnd = moment.tz(`${dateStr}T${todayHours.close}:00`, timezone);

  // 2. Fetch Barbers
  // A barber is considered capable if they have the service in their services array, 
  // or if they have no services specified (assumes they can do all for legacy data).
  const allBarbers = await BarberProfile.find({ 
    salonId: shopId, 
    status: 'active' 
  }).lean();

  
  const qualifiedBarbers = allBarbers.filter(b => {
    // Check if they work today
    const bHours = b.availability?.[dayOfWeek];
    if (!bHours || !bHours.isWorking) return false;

    
    // Phase 22: Is barber on leave today?
    if (onLeaveBarberIds.includes(barber._id.toString())) {
        return false;
    }

    // Phase 19: Check compatibility for all requested services

    if (b.services && b.services.length > 0) {
      let requiredServices = [];
      if (Array.isArray(service)) requiredServices = service;
      else if (service) requiredServices = [service];
      
      const canDoAll = requiredServices.every(reqS => 
        b.services.some(bS => bS.name.toLowerCase() === reqS.name.toLowerCase())
      );
      if (!canDoAll) return false;
    }
    return true;
  });


  if (qualifiedBarbers.length === 0) {
    return []; // No barbers can do this today
  }

  
  // 3. Fetch Chairs
  const chairs = await Chair.find({ shopId, status: 'available', active: true }).lean();
  
  // Phase 22: Fetch Approved Leaves for this shop on this date
  const _startOfDay = reqDate.clone().startOf('day');
  const _endOfDay = reqDate.clone().endOf('day');
  
  const approvedLeaves = await LeaveRequest.find({
      shopId,
      status: 'APPROVED',
      startDate: { $lte: _endOfDay.toDate() },
      endDate: { $gte: _startOfDay.toDate() }
  }).lean();
  
  const onLeaveBarberIds = approvedLeaves.map(l => l.staffId.toString());

  
  // If no specific chairs modeled, we assume 1 chair per barber as a fallback
  let chairCount = chairs.length;
  if (chairCount === 0) {
     chairCount = qualifiedBarbers.length; // Fallback
  }

  // 4. Fetch Existing Appointments for this day
  const startOfDay = reqDate.clone().startOf('day');
  const endOfDay = reqDate.clone().endOf('day');

  const query = {
    salon: shopId,
    status: { $in: ['pending', 'confirmed'] },
    startTime: { $lt: endOfDay.toDate() },
    endTime: { $gt: startOfDay.toDate() }
  };
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  const appointments = await Appointment.find(query).lean();

  
  // 5. Generate Slots
  const slots = [];
  let currentTime = shopStart.clone();
  const now = moment().tz(timezone);

  // Phase 19: Calculate total duration if multiple services
  let durationMin = 30;
  let serviceList = [];
  if (Array.isArray(service)) {
    serviceList = service;
    durationMin = service.reduce((acc, s) => acc + (s.duration || 30), 0);
  } else if (service) {
    serviceList = [service];
    durationMin = service.duration || 30;
  }


  while (currentTime.clone().add(durationMin, 'minutes').isSameOrBefore(shopEnd)) {
    const slotStart = currentTime.clone();
    const slotEnd = slotStart.clone().add(durationMin, 'minutes');

    // Skip past slots for today
    if (slotStart.isBefore(now)) {
      currentTime.add(SLOT_INTERVAL, 'minutes');
      continue;
    }

    const availableBarbers = [];
    let busyChairCount = 0;

    // Find overlapping appointments for this specific slot
    const overlappingAppts = appointments.filter(apt => {
      const aptStart = moment(apt.startTime).tz(timezone);
      const aptEnd = moment(apt.endTime).tz(timezone);
      // Conflict: aptStart < slotEnd && aptEnd > slotStart
      return aptStart.isBefore(slotEnd) && aptEnd.isAfter(slotStart);
    });

    // Count busy chairs (those occupied by overlapping appointments)
    const occupiedChairIds = overlappingAppts.map(a => a.chair?.toString()).filter(Boolean);
    // If appointment has no explicit chair, we assume it takes 1 generic chair
    const genericChairUsage = overlappingAppts.filter(a => !a.chair).length;
    busyChairCount = new Set(occupiedChairIds).size + genericChairUsage;

    // Check if we have physical space
    if (busyChairCount >= chairCount) {
       currentTime.add(SLOT_INTERVAL, 'minutes');
       continue;
    }

    // Check Barber Availability
    for (const barber of qualifiedBarbers) {
      const bHours = barber.availability[dayOfWeek];
      const bStart = moment.tz(`${dateStr}T${bHours.start}:00`, timezone);
      const bEnd = moment.tz(`${dateStr}T${bHours.end}:00`, timezone);

      // Is the slot within barber's working hours?
      if (slotStart.isSameOrAfter(bStart) && slotEnd.isSameOrBefore(bEnd)) {
        // Is barber on break?
        let onBreak = false;
        if (barber.breaks && barber.breaks.length > 0) {
           onBreak = barber.breaks.some(brk => {
              if (brk.day !== dayOfWeek) return false;
              const brkStart = moment.tz(`${dateStr}T${brk.start}:00`, timezone);
              const brkEnd = moment.tz(`${dateStr}T${brk.end}:00`, timezone);
              return brkStart.isBefore(slotEnd) && brkEnd.isAfter(slotStart);
           });
        }

        if (!onBreak) {
          // Is barber busy with another appointment?
          const isBusy = overlappingAppts.some(apt => apt.barber?.toString() === barber._id.toString());
          if (!isBusy) {
            availableBarbers.push(barber._id.toString());
          }
        }
      }
    }

    if (availableBarbers.length > 0) {
      slots.push({
        startTime: slotStart.format('HH:mm'),
        endTime: slotEnd.format('HH:mm'),
        available: true,
        availableBarbers
      });
    }

    currentTime.add(SLOT_INTERVAL, 'minutes');
  }

  return slots;
};
