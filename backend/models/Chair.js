import mongoose from 'mongoose';

const chairSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salon',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'maintenance', 'inactive'],
      default: 'available',
    },
    active: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

const Chair = mongoose.model('Chair', chairSchema);
export default Chair;
