import mongoose from 'mongoose';

const ticketMessageSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['customer', 'owner', 'admin'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isInternalNote: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

ticketMessageSchema.index({ ticket: 1, createdAt: 1 });

const TicketMessage = mongoose.model('TicketMessage', ticketMessageSchema);
export default TicketMessage;
