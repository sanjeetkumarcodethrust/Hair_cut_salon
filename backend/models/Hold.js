import mongoose from 'mongoose';

const holdSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
  barberId: { type: mongoose.Schema.Types.ObjectId, ref: 'BarberProfile' },
  chairId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chair' },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

// TTL index to automatically expire holds (e.g. 2 minutes)
holdSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// We can optionally add an index to prevent overlapping holds for the same barber/chair
// But for now, we'll manually check it or rely on transactions.

const Hold = mongoose.model('Hold', holdSchema);
export default Hold;
