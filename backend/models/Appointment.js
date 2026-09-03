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
    // Legacy single service reference (maintained for backward compatibility)
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      // No longer required to support multi-service
    },
    service: {
      name: { type: String },
      price: { type: Number },
      duration: { type: Number },
    },
    
    // New array for Phase 19 Multi-Service
    services: [
      {
        serviceId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        duration: { type: Number, required: true },
      }
    ],

    // Total duration of the booking
    totalDuration: {
      type: Number, 
      default: 0
    },

    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String, // e.g. "10:30"
      required: true,
    },

    originalPrice: {
      type: Number
    },
    loyaltyPointsEarned: {
      type: Number,
      default: 0
    },
    loyaltyDiscountAmount: {
      type: Number,
      default: 0
    },
    pointsRedeemed: {
      type: Number,
      default: 0
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    couponCode: {
      type: String
    },
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon'
    },
    price: {
      type: Number,
      required: true,
    },
    bookingType: {
      type: String,
      enum: ['instant', 'scheduled', 'walk_in'],
      default: 'instant',
    },
    snapshots: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'arrived', 'in_progress', 'completed', 'no_show', 'cancelled'],
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
    advanceAmount: {
      type: Number,
      default: 0
    },
    remainingAmount: {
      type: Number,
      default: 0
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
