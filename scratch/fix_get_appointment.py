import re

with open('backend/controllers/appointmentController.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_func = """export const getAppointment = async (req, res) => {
  try {
    const appointment = await populateAppointment(
      Appointment.findById(req.params.id)
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};"""

new_func = """export const getAppointment = async (req, res) => {
  try {
    const appointment = await populateAppointment(
      Appointment.findById(req.params.id)
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Ownership verification for customers
    if (req.user.role === 'customer') {
       if (appointment.customer?._id?.toString() !== req.user._id.toString() && appointment.customer?.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: 'You are not authorized to view this booking' });
       }
    } else if (req.user.role === 'owner') {
       // Owners can only view bookings for their salons
       const salons = await Salon.find({ owner: req.user._id }).lean();
       const salonIds = salons.map(s => s._id.toString());
       if (!salonIds.includes(appointment.salon?._id?.toString() && appointment.salon?.toString())) {
          // It's possible the populated salon object has _id
          const aptSalonId = appointment.salon?._id ? appointment.salon._id.toString() : appointment.salon?.toString();
          if (!salonIds.includes(aptSalonId)) {
             return res.status(403).json({ message: 'Not authorized to view this booking' });
          }
       }
    } else if (req.user.role === 'barber') {
       const aptBarberId = appointment.barber?._id ? appointment.barber._id.toString() : appointment.barber?.toString();
       if (aptBarberId !== req.user._id.toString()) {
          return res.status(403).json({ message: 'Not authorized to view this booking' });
       }
    }

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};"""

content = content.replace(old_func, new_func)

with open('backend/controllers/appointmentController.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added ownership verification to getAppointment")
