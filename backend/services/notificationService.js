import webpush from 'web-push';
import DeviceToken from '../models/DeviceToken.js';
import Notification from '../models/Notification.js';

// VAPID keys would typically be in .env. 
// For this environment, we'll auto-generate them if not provided.
// DO NOT do this in a real production environment without persisting them!
// We'll simulate fetching from process.env or generate once.

const publicKey = process.env.VAPID_PUBLIC_KEY || 'BM2vD7YFpMyQzF6C-X1eZ-988H_aT_bO-0_8-6L7X8Y_8X_8Y_8X_8Y_8X_8Y_8X_8Y';
const privateKey = process.env.VAPID_PRIVATE_KEY || 'Y_8X_8Y_8X_8Y_8X_8Y_8X_8Y_8X_8Y_8X_8Y_8X_8Y';

try {
  // Try to set VAPID details, but if keys are mock strings it will throw
  webpush.setVapidDetails(
    'mailto:test@example.com',
    publicKey,
    privateKey
  );
} catch (e) {
  const vapidKeys = webpush.generateVAPIDKeys();
  webpush.setVapidDetails(
    'mailto:test@example.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
  process.env.VAPID_PUBLIC_KEY = vapidKeys.publicKey;
  process.env.VAPID_PRIVATE_KEY = vapidKeys.privateKey;
  console.log("Generated transient VAPID keys for Web Push");
}

export const getPublicKey = () => process.env.VAPID_PUBLIC_KEY;

export const sendPushNotification = async (userId, notificationData) => {
  try {
    // Save notification to DB for idempotency and history
    let notif;
    if (notificationData.idemKey) {
       // Check idempotency
       const existing = await Notification.findOne({ idemKey: notificationData.idemKey });
       if (existing) {
          console.log(`Notification already sent for idemKey: ${notificationData.idemKey}`);
          return existing;
       }
    }
    
    notif = await Notification.create({
      userId,
      type: notificationData.type,
      title: notificationData.title,
      body: notificationData.body,
      bookingId: notificationData.bookingId,
      metadata: notificationData.metadata,
      idemKey: notificationData.idemKey,
      status: 'pending'
    });

    // Find active device tokens for the user
    const tokens = await DeviceToken.find({ userId, active: true });
    
    if (tokens.length === 0) {
      notif.status = 'failed';
      notif.metadata = { ...notif.metadata, reason: 'No active device tokens' };
      await notif.save();
      return notif;
    }

    const payload = JSON.stringify({
      title: notificationData.title,
      body: notificationData.body,
      data: {
         url: `/bookings/${notificationData.bookingId}`,
         type: notificationData.type,
         bookingId: notificationData.bookingId
      }
    });

    let sentCount = 0;
    
    for (const token of tokens) {
      try {
        const pushSubscription = {
          endpoint: token.endpoint,
          keys: {
            p256dh: token.keys.p256dh,
            auth: token.keys.auth
          }
        };
        await webpush.sendNotification(pushSubscription, payload);
        sentCount++;
      } catch (err) {
        console.error('Push error for token', token._id, err);
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Token is invalid/expired, remove it
          token.active = false;
          await token.save();
        }
      }
    }

    if (sentCount > 0) {
      notif.status = 'sent';
      notif.sentAt = new Date();
    } else {
      notif.status = 'failed';
    }
    await notif.save();
    
    return notif;
  } catch (error) {
    console.error("Error sending push notification:", error);
    // Notification failure must NOT break the application flow.
    return null;
  }
};
