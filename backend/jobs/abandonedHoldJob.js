import cron from 'node-cron';
import Appointment from '../models/Appointment.js';

export const startAbandonedHoldJob = () => {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      // Find appointments created more than 15 minutes ago that are still pending payment
      const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
      
      const abandonedAppointments = await Appointment.find({
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: { $lt: fifteenMinsAgo }
      });

      if (abandonedAppointments.length > 0) {
        console.log(`[CRON] Expiring ${abandonedAppointments.length} abandoned holds...`);
        for (const apt of abandonedAppointments) {
          apt.status = 'cancelled';
          apt.cancellationReason = 'Payment hold expired';
          await apt.save();
        }
      }
    } catch (error) {
      console.error(`[CRON] Error expiring holds: ${error.message}`);
    }
  });
};
