import BarberProfile from '../models/BarberProfile.js';

// @desc    Get all barber profiles
// @route   GET /api/barbers
// @access  Public
export const getBarberProfiles = async (req, res) => {
  try {
    const profiles = await BarberProfile.find()
      .populate('user', 'name email avatar')
      .populate('salonId', 'name address city state');
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
// @route   POST /api/barbers  |  PUT /api/barbers/:id
// @access  Private/Barber, Admin
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

// @desc    Delete barber profile
// @route   DELETE /api/barbers/:id
// @access  Private/Barber, Admin
export const deleteBarberProfile = async (req, res) => {
  try {
    const profile = await BarberProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({ message: 'Barber profile not found' });
    }

    // Only the owner or admin can delete
    if (profile.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this profile' });
    }

    await BarberProfile.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Barber profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GALLERY ──────────────────────────────────────────────────────────────────

// @desc    Add image(s) to gallery
// @route   POST /api/barbers/:id/gallery
// @access  Private/Barber, Admin
export const addToGallery = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: 'Please provide an imageUrl' });
    }

    const profile = await BarberProfile.findByIdAndUpdate(
      req.params.id,
      { $push: { gallery: imageUrl } },
      { new: true }
    );

    if (!profile) return res.status(404).json({ message: 'Barber profile not found' });

    res.status(200).json({ message: 'Image added to gallery', gallery: profile.gallery });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove image from gallery by index
// @route   DELETE /api/barbers/:id/gallery/:imageIndex
// @access  Private/Barber, Admin
export const removeFromGallery = async (req, res) => {
  try {
    const profile = await BarberProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: 'Barber profile not found' });

    const idx = parseInt(req.params.imageIndex);
    if (idx < 0 || idx >= profile.gallery.length) {
      return res.status(400).json({ message: 'Invalid image index' });
    }

    profile.gallery.splice(idx, 1);
    await profile.save();

    res.status(200).json({ message: 'Image removed from gallery', gallery: profile.gallery });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── PORTFOLIO ────────────────────────────────────────────────────────────────

// @desc    Add image(s) to portfolio
// @route   POST /api/barbers/:id/portfolio
// @access  Private/Barber, Admin
export const addToPortfolio = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: 'Please provide an imageUrl' });
    }

    const profile = await BarberProfile.findByIdAndUpdate(
      req.params.id,
      { $push: { portfolio: imageUrl } },
      { new: true }
    );

    if (!profile) return res.status(404).json({ message: 'Barber profile not found' });

    res.status(200).json({ message: 'Image added to portfolio', portfolio: profile.portfolio });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove image from portfolio by index
// @route   DELETE /api/barbers/:id/portfolio/:imageIndex
// @access  Private/Barber, Admin
export const removeFromPortfolio = async (req, res) => {
  try {
    const profile = await BarberProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: 'Barber profile not found' });

    const idx = parseInt(req.params.imageIndex);
    if (idx < 0 || idx >= profile.portfolio.length) {
      return res.status(400).json({ message: 'Invalid image index' });
    }

    profile.portfolio.splice(idx, 1);
    await profile.save();

    res.status(200).json({ message: 'Image removed from portfolio', portfolio: profile.portfolio });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── SERVICES ─────────────────────────────────────────────────────────────────

// @desc    Add a service to barber profile
// @route   POST /api/barbers/:id/services
// @access  Private/Barber, Admin
export const addService = async (req, res) => {
  try {
    const { name, price, duration } = req.body;

    if (!name || !price || !duration) {
      return res.status(400).json({ message: 'Please provide name, price, and duration for the service' });
    }

    const profile = await BarberProfile.findByIdAndUpdate(
      req.params.id,
      { $push: { services: { name, price, duration } } },
      { new: true, runValidators: true }
    );

    if (!profile) return res.status(404).json({ message: 'Barber profile not found' });

    res.status(200).json({ message: 'Service added', services: profile.services });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove a service from barber profile
// @route   DELETE /api/barbers/:id/services/:serviceId
// @access  Private/Barber, Admin
export const removeService = async (req, res) => {
  try {
    const profile = await BarberProfile.findByIdAndUpdate(
      req.params.id,
      { $pull: { services: { _id: req.params.serviceId } } },
      { new: true }
    );

    if (!profile) return res.status(404).json({ message: 'Barber profile not found' });

    res.status(200).json({ message: 'Service removed', services: profile.services });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
