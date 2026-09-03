import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
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
  dateString: {
    type: String, // YYYY-MM-DD in shop local time
    required: true
  },
  checkIn: {
    type: Date
  },
  checkOut: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Present', 'Late', 'Absent', 'Half-day'],
    default: 'Present'
  }
}, { timestamps: true });

// A staff member can only have one attendance record per day
attendanceSchema.index({ staffId: 1, dateString: 1 }, { unique: true });

export default mongoose.model('AttendanceRecord', attendanceSchema);
