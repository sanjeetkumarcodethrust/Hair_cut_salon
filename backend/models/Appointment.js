import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    salon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salon',
      required: true,
    },
    barber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Specific barber booked
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    services: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        duration: { type: Number, required: true },
      },
    ],
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String, // e.g., "10:00"
      required: true,
    },
    endTime: {
      type: String, // e.g., "11:00"
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'NoShow'],
      default: 'Pending',
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Refunded'],
      default: 'Pending',
    },
    stripePaymentIntentId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
