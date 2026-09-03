import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BarberProfile',
    required: true
  },
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Salon',
    required: true
  },
  leaveType: {
    type: String,
    enum: ['Personal', 'Sick', 'Vacation', 'Emergency', 'Other'],
    default: 'Personal'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
    default: 'PENDING'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  }
}, { timestamps: true });

leaveRequestSchema.index({ staffId: 1, startDate: 1, endDate: 1 });
leaveRequestSchema.index({ shopId: 1, status: 1 });

export default mongoose.model('LeaveRequest', leaveRequestSchema);
