import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salon',
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    category: {
      type: String,
      enum: [
        'Booking Issue',
        'Payment Issue',
        'Refund Request',
        'Cancellation Issue',
        'Service Complaint',
        'Shop/Barber Complaint',
        'Technical Issue',
        'Other'
      ],
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['open', 'in_review', 'assigned', 'waiting_for_customer', 'resolved', 'closed'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

ticketSchema.index({ customer: 1 });
ticketSchema.index({ shop: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ createdAt: -1 });

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
