import mongoose from 'mongoose';

const deviceTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    platform: {
      type: String,
      enum: ['web', 'android', 'ios'],
      default: 'web',
    },
    active: {
      type: Boolean,
      default: true,
    },
    // For Web Push, the token is often a stringified JSON containing endpoint and keys
    endpoint: {
      type: String,
    },
    keys: {
      p256dh: String,
      auth: String,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const DeviceToken = mongoose.model('DeviceToken', deviceTokenSchema);
export default DeviceToken;
