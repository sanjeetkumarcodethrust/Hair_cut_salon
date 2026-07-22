import BarberProfile from '../models/BarberProfile.js';

// @desc    Get all barber profiles
// @route   GET /api/barbers
// @access  Public
export const getBarberProfiles = async (req, res) => {
  try {
    const profiles = await BarberProfile.find().populate('user', 'name email avatar').populate('salonId', 'name address city state');
    res.status(200).json(profiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single barber profile
// @route   GET /api/barbers/:id
// @access  Public
export const getBarberProfile = async (req, res) => {
  try {
    const profile = await BarberProfile.findById(req.params.id)
      .populate('user', 'name email avatar phone')
      .populate('salonId', 'name address city state');
      
    if (profile) {
      res.status(200).json(profile);
    } else {
      res.status(404).json({ message: 'Barber profile not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create or update barber profile
// @route   POST /api/barbers
// @access  Private/Barber
export const createOrUpdateBarberProfile = async (req, res) => {
  try {
    const profileFields = {
      ...req.body,
      user: req.user._id,
    };

    let profile = await BarberProfile.findOne({ user: req.user._id });

    if (profile) {
      // Update
      profile = await BarberProfile.findOneAndUpdate(
        { user: req.user._id },
        { $set: profileFields },
        { new: true, runValidators: true }
      );
      return res.status(200).json(profile);
    }

    // Create
    profile = new BarberProfile(profileFields);
    await profile.save();
    res.status(201).json(profile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
