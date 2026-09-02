import cron from 'node-cron';
import Appointment from '../models/Appointment.js';
import Salon from '../models/Salon.js';
import moment from 'moment-timezone';
import { sendPushNotification } from '../services/notificationService.js';

// Run every 15 minutes to check for upcoming appointments
const startReminderJob = () => {
  cron.schedule('*/15 * * * *', async () => {
    console.log('[CRON] Running reminder job...');
    try {
      const now = moment().tz('Asia/Kolkata');
      const upper24h = now.clone().add(24, 'hours').add(15, 'minutes');
      const lower24h = now.clone().add(24, 'hours');

      const upper1h = now.clone().add(1, 'hours').add(15, 'minutes');
      const lower1h = now.clone().add(1, 'hours');

      // Find appointments that are pending/confirmed and start time falls within our windows
      const appointments = await Appointment.find({
        status: { $in: ['pending', 'confirmed'] },
        $or: [
          { startTime: { $gte: lower24h.toDate(), $lt: upper24h.toDate() } },
          { startTime: { $gte: lower1h.toDate(), $lt: upper1h.toDate() } }
        ]
      }).populate('salon');

      for (const apt of appointments) {
        if (!apt.salon) continue;

        const aptTime = moment(apt.startTime).tz('Asia/Kolkata');
        const diffHours = aptTime.diff(now, 'hours');
        
        let type = '';
        let title = '';
        let body = '';
        let idemKey = '';

        if (diffHours >= 23 && diffHours <= 24) {
          type = 'BOOKING_REMINDER_24H';
          title = 'Reminder: Appointment Tomorrow';
          body = `Your appointment at ${apt.salon.name} is tomorrow at ${apt.time}.`;
          idemKey = `reminder_24h_${apt._id}_${new Date(apt.startTime).getTime()}`;
        } else if (diffHours === 1 || diffHours === 0) {
          type = 'BOOKING_REMINDER_1H';
          title = 'Reminder: Appointment Soon';
          body = `Your appointment at ${apt.salon.name} is starting in an hour at ${apt.time}.`;
          idemKey = `reminder_1h_${apt._id}_${new Date(apt.startTime).getTime()}`;
        }

        if (type) {
          await sendPushNotification(apt.customer, {
            type: 'BOOKING_REMINDER',
            title,
            body,
            bookingId: apt._id,
            idemKey
          });
        }
      }
    } catch (err) {
      console.error('[CRON] Error in reminder job:', err);
    }
  });
};

export default startReminderJob;
