import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─── Email Templates ───────────────────────────────────────────────────────────

const bookingConfirmedEmail = (appointment, customerName) => ({
  subject: '✅ Appointment Confirmed!',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Your Appointment is Confirmed!</h2>
      <p>Hi <strong>${customerName}</strong>,</p>
      <p>Your appointment has been confirmed. Here are your details:</p>
      <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background:#f3f4f6;"><td style="padding:10px;"><strong>Service</strong></td><td style="padding:10px;">${appointment.service.name}</td></tr>
        <tr><td style="padding:10px;"><strong>Date</strong></td><td style="padding:10px;">${new Date(appointment.date).toDateString()}</td></tr>
        <tr style="background:#f3f4f6;"><td style="padding:10px;"><strong>Time</strong></td><td style="padding:10px;">${appointment.time}</td></tr>
        <tr><td style="padding:10px;"><strong>Price</strong></td><td style="padding:10px;">₹${appointment.price}</td></tr>
      </table>
      <p>We look forward to seeing you! 💇</p>
    </div>
  `,
});

const bookingPendingEmail = (appointment, customerName) => ({
  subject: '📅 Appointment Booked — Awaiting Confirmation',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">Appointment Awaiting Confirmation</h2>
      <p>Hi <strong>${customerName}</strong>,</p>
      <p>Your appointment request has been received and is awaiting owner approval.</p>
      <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background:#f3f4f6;"><td style="padding:10px;"><strong>Service</strong></td><td style="padding:10px;">${appointment.service.name}</td></tr>
        <tr><td style="padding:10px;"><strong>Date</strong></td><td style="padding:10px;">${new Date(appointment.date).toDateString()}</td></tr>
        <tr style="background:#f3f4f6;"><td style="padding:10px;"><strong>Time</strong></td><td style="padding:10px;">${appointment.time}</td></tr>
        <tr><td style="padding:10px;"><strong>Price</strong></td><td style="padding:10px;">₹${appointment.price}</td></tr>
      </table>
      <p>You will receive another email once the salon confirms your booking.</p>
    </div>
  `,
});

const bookingCancelledEmail = (appointment, customerName, reason) => ({
  subject: '❌ Appointment Cancelled',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ef4444;">Appointment Cancelled</h2>
      <p>Hi <strong>${customerName}</strong>,</p>
      <p>Your appointment on <strong>${new Date(appointment.date).toDateString()}</strong> at <strong>${appointment.time}</strong> has been cancelled.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>Feel free to book a new appointment at your convenience.</p>
    </div>
  `,
});

const bookingRescheduledEmail = (appointment, customerName) => ({
  subject: '🔄 Appointment Rescheduled',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3b82f6;">Appointment Rescheduled</h2>
      <p>Hi <strong>${customerName}</strong>,</p>
      <p>Your appointment has been rescheduled to:</p>
      <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background:#f3f4f6;"><td style="padding:10px;"><strong>New Date</strong></td><td style="padding:10px;">${new Date(appointment.rescheduleDate).toDateString()}</td></tr>
        <tr><td style="padding:10px;"><strong>New Time</strong></td><td style="padding:10px;">${appointment.rescheduleTime}</td></tr>
        <tr style="background:#f3f4f6;"><td style="padding:10px;"><strong>Service</strong></td><td style="padding:10px;">${appointment.service.name}</td></tr>
      </table>
      <p>See you soon! 💈</p>
    </div>
  `,
});

const ownerNewBookingEmail = (appointment, ownerName) => ({
  subject: '🔔 New Appointment Booking Request',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">New Booking Request</h2>
      <p>Hi <strong>${ownerName}</strong>,</p>
      <p>You have a new appointment booking request waiting for your approval.</p>
      <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background:#f3f4f6;"><td style="padding:10px;"><strong>Service</strong></td><td style="padding:10px;">${appointment.service.name}</td></tr>
        <tr><td style="padding:10px;"><strong>Date</strong></td><td style="padding:10px;">${new Date(appointment.date).toDateString()}</td></tr>
        <tr style="background:#f3f4f6;"><td style="padding:10px;"><strong>Time</strong></td><td style="padding:10px;">${appointment.time}</td></tr>
        <tr><td style="padding:10px;"><strong>Price</strong></td><td style="padding:10px;">₹${appointment.price}</td></tr>
      </table>
      <p>Please log in to your dashboard to confirm or reject this appointment.</p>
    </div>
  `,
});

// ─── Send Mail Helper ──────────────────────────────────────────────────────────

export const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Salon App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email send error:', error.message);
  }
};

export {
  bookingConfirmedEmail,
  bookingPendingEmail,
  bookingCancelledEmail,
  bookingRescheduledEmail,
  ownerNewBookingEmail,
};
