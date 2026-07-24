import Stripe from 'stripe';
import Appointment from '../models/Appointment.js';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey && stripeSecretKey !== 'placeholder' ? new Stripe(stripeSecretKey) : null;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

const formatAmount = (amount) => Math.round(Number(amount || 0) * 100);

export const createCheckoutSessionForAppointment = async (appointment, user) => {
  if (!appointment) {
    throw new Error('Appointment is required');
  }

  if (appointment.paymentStatus === 'paid') {
    return { url: null, sessionId: appointment.stripePaymentIntentId || null, paymentStatus: appointment.paymentStatus };
  }

  if (!stripe) {
    appointment.paymentStatus = 'paid';
    appointment.status = 'confirmed';
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
          currency: 'inr',
          product_data: {
            name: appointment.service?.name || 'Salon appointment',
          },
          unit_amount: formatAmount(appointment.price),
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

  appointment.stripePaymentIntentId = session.payment_intent || session.id;
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
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const payment = await createCheckoutSessionForAppointment(appointment, req.user);
    res.status(200).json({ message: 'Checkout ready', payment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const { appointmentId, sessionId } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    let paymentConfirmed = true;

    if (stripe && sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      paymentConfirmed = session.payment_status === 'paid';
    }

    if (paymentConfirmed) {
      appointment.paymentStatus = 'paid';
      appointment.status = 'confirmed';
      await appointment.save();
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
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

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
