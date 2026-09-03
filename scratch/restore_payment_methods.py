import re

with open('backend/controllers/paymentController.js', 'r', encoding='utf-8') as f:
    content = f.read()

restored_methods = """
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
"""

content = content + "\n" + restored_methods

with open('backend/controllers/paymentController.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Restored getPaymentHistory and refundPayment")
