import Stripe from 'stripe';
import Appointment from '../models/Appointment.js';
import env from '../config/env.js';
import { emitBookingConfirmed } from '../services/bookingEventEmitter.js';
import Salon from '../models/Salon.js';

const stripeSecretKey = env.stripeSecretKey;
const stripe = stripeSecretKey && stripeSecretKey !== 'placeholder' ? new Stripe(stripeSecretKey) : null;
const frontendUrl = env.frontendUrl;

const formatAmount = (amount) => Math.round(Number(amount || 0) * 100);

export const createCheckoutSessionForAppointment = async (appointment, user) => {
  if (!appointment) throw new Error('Appointment is required');

  if (appointment.paymentStatus === 'paid') {
    return { url: null, sessionId: appointment.stripePaymentIntentId || null, paymentStatus: appointment.paymentStatus };
  }

  // Calculate amount to pay online (advance or full)
  const amountToPay = appointment.advanceAmount > 0 ? appointment.advanceAmount : appointment.price;

  if (env.paymentMode === 'test' || !stripe) {
    // For test mode without stripe configured, mock the flow
    appointment.stripePaymentIntentId = `mock_${appointment._id.toString()}`;
    await appointment.save();

    return {
      url: `${frontendUrl}/payments/success?appointmentId=${appointment._id.toString()}`,
      sessionId: appointment.stripePaymentIntentId,
      paymentStatus: appointment.paymentStatus,
    };
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: user?.email,
    line_items: [
      {
        price_data: {
          currency: env.stripeCurrency,
          product_data: {
            name: `${appointment.service?.name || env.defaultAppointmentName}${appointment.advanceAmount > 0 ? ' (Advance Payment)' : ''}`,
          },
          unit_amount: formatAmount(amountToPay),
        },
        quantity: 1,
      },
    ],
    success_url: `${frontendUrl}/payments/success?session_id={CHECKOUT_SESSION_ID}&appointmentId=${appointment._id.toString()}`,
    cancel_url: `${frontendUrl}/payments/cancel?appointmentId=${appointment._id.toString()}`,
    metadata: {
      appointmentId: appointment._id.toString(),
      userId: user?._id?.toString() || '',
    },
  });

  appointment.stripePaymentIntentId = session.id;
  await appointment.save();

  return {
    url: session.url,
    sessionId: session.id,
    paymentStatus: appointment.paymentStatus,
  };
};

export const createCheckoutSession = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    
    // Ensure ownership
    if (appointment.customer.toString() !== req.user._id.toString()) {
       return res.status(403).json({ message: 'Not authorized to pay for this appointment' });
    }

    const payment = await createCheckoutSessionForAppointment(appointment, req.user);
    res.status(200).json({ message: 'Checkout ready', payment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    if (!env.stripeWebhookSecret) {
      console.warn("No stripeWebhookSecret found, skipping signature verification (NOT SAFE FOR PRODUCTION)");
      event = req.body;
    } else {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, env.stripeWebhookSecret);
    }
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const appointmentId = session.metadata.appointmentId;
    
    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (appointment && appointment.paymentStatus !== 'paid') {
        appointment.paymentStatus = 'paid';
        appointment.status = 'confirmed';
        await appointment.save();
        
        // Trigger notification
        const salon = await Salon.findById(appointment.salon);
        if (salon) emitBookingConfirmed(appointment, salon);
      }
    }
  }

  res.json({ received: true });
};

export const confirmPayment = async (req, res) => {
  // This endpoint is mostly for frontend fast-polling to check state,
  // The ACTUAL authoritative change happens via Webhooks for security.
  try {
    const { appointmentId, sessionId } = req.body;
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    let paymentConfirmed = false;

    if (sessionId && sessionId.startsWith('mock_')) {
      paymentConfirmed = true;
    } else if (stripe && sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      paymentConfirmed = session.payment_status === 'paid';
    }

    if (paymentConfirmed && appointment.paymentStatus !== 'paid') {
      appointment.paymentStatus = 'paid';
      appointment.status = 'confirmed';
      await appointment.save();
      
      const salon = await Salon.findById(appointment.salon);
      if (salon) emitBookingConfirmed(appointment, salon);
    }

    if (appointment.paymentStatus === 'paid') {
      return res.status(200).json({ message: 'Payment confirmed', appointment });
    }

    return res.status(402).json({ message: 'Payment not completed yet' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const getPaymentHistory = async (req, res) => {
  try {
    const appointments = await Appointment.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const refundPayment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (appointment.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Only paid appointments can be refunded' });
    }

    if (stripe && appointment.stripePaymentIntentId && appointment.stripePaymentIntentId.startsWith('pi_')) {
      await stripe.refunds.create({ payment_intent: appointment.stripePaymentIntentId });
    }

    appointment.paymentStatus = 'refunded';
    appointment.status = 'cancelled';
    await appointment.save();

    res.status(200).json({ message: 'Refund processed', appointment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
