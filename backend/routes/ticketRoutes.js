import express from 'express';
import {
  createTicket,
  getCustomerTickets,
  getShopTickets,
  getAdminTickets,
  getTicketDetails,
  addTicketMessage,
  updateTicket
} from '../controllers/ticketController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createTicket);
router.get('/customer', protect, getCustomerTickets);
router.get('/shop/:shopId', protect, authorize('owner', 'admin'), getShopTickets);
router.get('/admin', protect, authorize('admin'), getAdminTickets);
router.get('/:id', protect, getTicketDetails);
router.post('/:id/messages', protect, addTicketMessage);
router.put('/:id', protect, authorize('owner', 'admin'), updateTicket);

export default router;
