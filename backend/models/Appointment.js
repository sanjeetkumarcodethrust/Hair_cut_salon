import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    barber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BarberProfile',
    },
    chair: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chair',
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    salon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salon',
      required: true,
    },
    service: {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      duration: { type: Number, required: true }, // minutes
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String, // e.g. "10:30"
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    bookingType: {
      type: String,
      enum: ['instant', 'scheduled'],
      default: 'instant',
    },
    snapshots: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    cancellationReason: {
      type: String,
    },
    rescheduleDate: {
      type: Date,
    },
    rescheduleTime: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    stripePaymentIntentId: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);


appointmentSchema.index({ salon: 1, status: 1, startTime: 1, endTime: 1 });
appointmentSchema.index({ customer: 1, date: -1 });
appointmentSchema.index({ barber: 1, status: 1, startTime: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
