import Appointment from '../models/Appointment.js';

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private/Customer
export const createAppointment = async (req, res) => {
  try {
    const {
      salon,
      barber,
      services,
      date,
      startTime,
      endTime,
      totalAmount,
    } = req.body;

    const appointment = new Appointment({
      customer: req.user._id,
      salon,
      barber,
      services,
      date,
      startTime,
      endTime,
      totalAmount,
    });

    const savedAppointment = await appointment.save();

    res.status(201).json(savedAppointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get logged in user appointments
// @route   GET /api/appointments/myappointments
// @access  Private
export const getMyAppointments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Customer') {
      query = { customer: req.user._id };
    } else if (req.user.role === 'Barber') {
      query = { barber: req.user._id };
    } else if (req.user.role === 'SalonOwner') {
      // Find salons owned by this user
      const Salon = (await import('../models/Salon.js')).default;
      const salons = await Salon.find({ owner: req.user._id });
      const salonIds = salons.map((s) => s._id);
      query = { salon: { $in: salonIds } };
    } else if (req.user.role === 'Admin') {
      // Admin sees all
    }

    const appointments = await Appointment.find(query)
      .populate('salon', 'name address')
      .populate('barber', 'name avatar')
      .populate('customer', 'name email phone');

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private
export const updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Update status
    appointment.status = req.body.status || appointment.status;
    const updatedAppointment = await appointment.save();

    res.status(200).json(updatedAppointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
