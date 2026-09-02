import { sendPushNotification } from './notificationService.js';
import moment from 'moment-timezone';

// Triggered after successful booking confirmation
export const emitBookingConfirmed = (appointment, shop) => {
  setImmediate(async () => {
    try {
      const dateStr = new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const timeStr = appointment.time;
      const title = 'Booking Confirmed';
      const body = `Your appointment at ${shop.name} is confirmed for ${dateStr} at ${timeStr}.`;
      
      await sendPushNotification(appointment.customer, {
        type: 'BOOKING_CONFIRMED',
        title,
        body,
        bookingId: appointment._id,
        idemKey: `confirmed_${appointment._id}`
      });
    } catch (e) {
      console.error("Event error [emitBookingConfirmed]:", e);
    }
  });
};

export const emitBookingRescheduled = (appointment, shop) => {
  setImmediate(async () => {
    try {
      const dateStr = new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const timeStr = appointment.time;
      const title = 'Booking Rescheduled';
      const body = `Your appointment at ${shop.name} has been moved to ${dateStr} at ${timeStr}.`;
      
      await sendPushNotification(appointment.customer, {
        type: 'BOOKING_RESCHEDULED',
        title,
        body,
        bookingId: appointment._id,
        idemKey: `rescheduled_${appointment._id}_${Date.now()}` // unique per reschedule
      });
    } catch (e) {
      console.error("Event error [emitBookingRescheduled]:", e);
    }
  });
};

export const emitBookingCancelled = (appointment, shop) => {
  setImmediate(async () => {
    try {
      const origDateStr = appointment.snapshots?.originalDate 
           ? new Date(appointment.snapshots.originalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
           : new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const origTimeStr = appointment.snapshots?.originalTime || appointment.time;

      const title = 'Booking Cancelled';
      const body = `Your appointment at ${shop.name} on ${origDateStr} at ${origTimeStr} was cancelled.`;
      
      await sendPushNotification(appointment.customer, {
        type: 'BOOKING_CANCELLED',
        title,
        body,
        bookingId: appointment._id,
        idemKey: `cancelled_${appointment._id}`
      });
    } catch (e) {
      console.error("Event error [emitBookingCancelled]:", e);
    }
  });
};

// Scheduled Reminder logic can also trigger notifications directly via `sendPushNotification`
