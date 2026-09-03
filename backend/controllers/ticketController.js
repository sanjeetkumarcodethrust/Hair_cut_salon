import Ticket from '../models/Ticket.js';
import TicketMessage from '../models/TicketMessage.js';
import Appointment from '../models/Appointment.js';
import Salon from '../models/Salon.js';

// @desc    Create a new support ticket
// @route   POST /api/tickets
// @access  Private (Customer)
export const createTicket = async (req, res) => {
  try {
    const { category, subject, description, bookingId, priority } = req.body;
    let shopId = null;

    if (bookingId) {
      const booking = await Appointment.findById(bookingId);
      if (booking && booking.customer.toString() === req.user._id.toString()) {
        shopId = booking.salon;
      } else {
        return res.status(403).json({ message: 'Not authorized for this booking' });
      }
    }

    // Auto priority
    let finalPriority = priority || 'normal';
    if (category === 'Payment Issue' || category === 'Refund Request') finalPriority = 'high';

    const ticket = await Ticket.create({
      customer: req.user._id,
      shop: shopId,
      booking: bookingId,
      category,
      subject,
      priority: finalPriority
    });

    await TicketMessage.create({
      ticket: ticket._id,
      sender: req.user._id,
      senderRole: 'customer',
      message: description
    });

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tickets for current customer
// @route   GET /api/tickets/customer
// @access  Private
export const getCustomerTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ customer: req.user._id })
      .populate('shop', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tickets for a specific shop (Owner)
// @route   GET /api/tickets/shop/:shopId
// @access  Private
export const getShopTickets = async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.shopId);
    if (!salon || salon.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const tickets = await Ticket.find({ shop: req.params.shopId })
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tickets (Admin)
// @route   GET /api/tickets/admin
// @access  Private (Admin)
export const getAdminTickets = async (req, res) => {
  try {
    const { status, priority, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tickets = await Ticket.find(filter)
      .populate('customer', 'name email')
      .populate('shop', 'name')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get ticket details & conversation
// @route   GET /api/tickets/:id
// @access  Private
export const getTicketDetails = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('shop', 'name owner')
      .populate('booking', 'date time status price service serviceName')
      .populate('assignedTo', 'name');

    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    // Authorization
    let isAuthorized = false;
    if (req.user.role === 'admin') isAuthorized = true;
    else if (req.user._id.toString() === ticket.customer._id.toString()) isAuthorized = true;
    else if (req.user.role === 'owner' && ticket.shop && ticket.shop.owner.toString() === req.user._id.toString()) {
      isAuthorized = true;
    }

    if (!isAuthorized) return res.status(403).json({ message: 'Not authorized to view this ticket' });

    // Get messages, hide internal notes if not admin
    let msgFilter = { ticket: ticket._id };
    if (req.user.role !== 'admin') {
      msgFilter.isInternalNote = false;
    }

    const messages = await TicketMessage.find(msgFilter)
      .populate('sender', 'name role')
      .sort({ createdAt: 1 });

    res.status(200).json({ ticket, messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a message/note to ticket
// @route   POST /api/tickets/:id/messages
// @access  Private
export const addTicketMessage = async (req, res) => {
  try {
    const { message, isInternalNote } = req.body;
    const ticket = await Ticket.findById(req.params.id).populate('shop');
    
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    // Authorization
    let role = 'customer';
    if (req.user.role === 'admin') role = 'admin';
    else if (req.user.role === 'owner' && ticket.shop && ticket.shop.owner.toString() === req.user._id.toString()) {
      role = 'owner';
    } else if (req.user._id.toString() !== ticket.customer.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Only admins can add internal notes
    const internal = (isInternalNote && role === 'admin') ? true : false;

    const newMessage = await TicketMessage.create({
      ticket: ticket._id,
      sender: req.user._id,
      senderRole: role,
      message,
      isInternalNote: internal
    });

    if (!internal) {
       // Update ticket status automatically based on who replied
       if (role === 'customer' && ticket.status === 'waiting_for_customer') {
           ticket.status = 'in_review';
       } else if ((role === 'admin' || role === 'owner') && ticket.status === 'in_review') {
           ticket.status = 'waiting_for_customer';
       }
       // Mark reopened if it was closed/resolved and customer replied
       if (role === 'customer' && (ticket.status === 'closed' || ticket.status === 'resolved')) {
           ticket.status = 'in_review'; // reopened
       }
       await ticket.save();
    }

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update ticket status/priority/assignment
// @route   PUT /api/tickets/:id
// @access  Private (Owner/Admin)
export const updateTicket = async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.body;
    const ticket = await Ticket.findById(req.params.id).populate('shop');
    
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    let isAuthorized = false;
    if (req.user.role === 'admin') isAuthorized = true;
    else if (req.user.role === 'owner' && ticket.shop && ticket.shop.owner.toString() === req.user._id.toString()) {
      isAuthorized = true;
    }

    if (!isAuthorized) return res.status(403).json({ message: 'Not authorized' });

    if (status) ticket.status = status;
    
    if (req.user.role === 'admin') {
      if (priority) ticket.priority = priority;
      if (assignedTo !== undefined) ticket.assignedTo = assignedTo; // can be null to unassign
      if (assignedTo && ticket.status === 'open') ticket.status = 'assigned';
    }

    await ticket.save();
    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
