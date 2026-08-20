import BarberProfile from '../models/BarberProfile.js';

// @desc    Get all barber profiles with search/filter/pagination
// @route   GET /api/barbers?search=&specialization=&salonId=&city=&minRating=&availableOn=&page=&limit=
// @access  Public
export const getBarberProfiles = async (req, res) => {
  try {
    const {
      search,
      specialization,
      salonId,
      salon,
      city,
      location,
      minRating,
      availableOn,  // e.g. 'monday', 'tuesday' ...
      page = 1,
      limit = 10,
    } = req.query;

    const profileQuery = {};
    const joinedQuery = { $and: [] };

    if (search) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      profileQuery.$or = [{ name: searchRegex }, { 'user.name': searchRegex }];
    }

    if (specialization) {
      profileQuery.specialization = { $regex: specialization.trim(), $options: 'i' };
    }

    if (salonId) {
      profileQuery.salonId = salonId;
    }

    if (salon) {
      joinedQuery.$and.push({ $or: [
        { 'salon.name': { $regex: salon.trim(), $options: 'i' } },
        { 'salon.address': { $regex: salon.trim(), $options: 'i' } },
        { 'salon.city': { $regex: salon.trim(), $options: 'i' } },
        { 'salon.state': { $regex: salon.trim(), $options: 'i' } },
      ] });
    }

    if (city || location) {
      const locationRegex = { $regex: (location || city).trim(), $options: 'i' };
      joinedQuery.$and.push({ $or: [
        { 'salon.address': locationRegex },
        { 'salon.city': locationRegex },
        { 'salon.state': locationRegex },
      ] });
    }

    if (minRating) {
      const rating = parseFloat(minRating);
      if (!Number.isNaN(rating)) {
        profileQuery.rating = { $gte: rating };
      }
    }

    if (availableOn) {
      const day = availableOn.toLowerCase();
      const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      if (validDays.includes(day)) {
        profileQuery[`availability.${day}.isWorking`] = true;
      }
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(parseInt(limit, 10) || 10, 50);
    const startIndex = (pageNum - 1) * limitNum;

    const [result] = await BarberProfile.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
          pipeline: [{ $project: { name: 1, email: 1, profileImage: 1 } }],
        },
      },
      {
        $lookup: {
          from: 'salons',
          localField: 'salonId',
          foreignField: '_id',
          as: 'salonId',
          pipeline: [{ $project: { name: 1, address: 1, city: 1, state: 1 } }],
        },
      },
      { $set: { user: { $arrayElemAt: ['$user', 0] }, salonId: { $arrayElemAt: ['$salonId', 0] } } },
      { $match: { ...profileQuery, ...joinedQuery } },
      {
        $facet: {
          data: [
            { $sort: { rating: -1, createdAt: -1 } },
            { $skip: startIndex },
            { $limit: limitNum },
          ],
          metadata: [{ $count: 'total' }],
        },
      },
    ]);

    const profiles = result?.data || [];
    const total = result?.metadata?.[0]?.total || 0;

    res.status(200).json({
      success: true,
      count: profiles.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: profiles,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Get single barber profile
// @route   GET /api/barbers/:id
// @access  Public
export const getBarberProfile = async (req, res) => {
  try {
    const profile = await BarberProfile.findById(req.params.id)
      .populate('user', 'name email profileImage phone')
      .populate('salonId', 'name address city state');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Barber profile not found' });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
      profile = await BarberProfile.findOneAndUpdate(
        { user: req.user._id },
        { $set: profileFields },
        { new: true, runValidators: true }
      );
      return res.status(200).json({ success: true, data: profile });
    }

    profile = new BarberProfile(profileFields);
    await profile.save();
    res.status(201).json({ success: true, data: profile });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete barber profile
// @route   DELETE /api/barbers/:id
// @access  Private/Barber, Admin
export const deleteBarberProfile = async (req, res) => {
  try {
    const profile = await BarberProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Barber profile not found' });
    }

    if (profile.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this profile' });
    }

    await BarberProfile.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Barber profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GALLERY ──────────────────────────────────────────────────────────────────

export const addToGallery = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Please provide an imageUrl' });
    }
    const profile = await BarberProfile.findByIdAndUpdate(
      req.params.id,
      { $push: { gallery: imageUrl } },
      { new: true }
    );
    if (!profile) return res.status(404).json({ success: false, message: 'Barber profile not found' });
    res.status(200).json({ success: true, message: 'Image added to gallery', gallery: profile.gallery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeFromGallery = async (req, res) => {
  try {
    const profile = await BarberProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ success: false, message: 'Barber profile not found' });
    const idx = parseInt(req.params.imageIndex);
    if (idx < 0 || idx >= profile.gallery.length) {
      return res.status(400).json({ success: false, message: 'Invalid image index' });
    }
    profile.gallery.splice(idx, 1);
    await profile.save();
    res.status(200).json({ success: true, message: 'Image removed from gallery', gallery: profile.gallery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PORTFOLIO ────────────────────────────────────────────────────────────────

export const addToPortfolio = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Please provide an imageUrl' });
    }
    const profile = await BarberProfile.findByIdAndUpdate(
      req.params.id,
      { $push: { portfolio: imageUrl } },
      { new: true }
    );
    if (!profile) return res.status(404).json({ success: false, message: 'Barber profile not found' });
    res.status(200).json({ success: true, message: 'Image added to portfolio', portfolio: profile.portfolio });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeFromPortfolio = async (req, res) => {
  try {
    const profile = await BarberProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ success: false, message: 'Barber profile not found' });
    const idx = parseInt(req.params.imageIndex);
    if (idx < 0 || idx >= profile.portfolio.length) {
      return res.status(400).json({ success: false, message: 'Invalid image index' });
    }
    profile.portfolio.splice(idx, 1);
    await profile.save();
    res.status(200).json({ success: true, message: 'Image removed from portfolio', portfolio: profile.portfolio });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── SERVICES ─────────────────────────────────────────────────────────────────

export const addService = async (req, res) => {
  try {
    const { name, price, duration } = req.body;
    if (!name || !price || !duration) {
      return res.status(400).json({ success: false, message: 'Please provide name, price, and duration for the service' });
    }
    const profile = await BarberProfile.findByIdAndUpdate(
      req.params.id,
      { $push: { services: { name, price, duration } } },
      { new: true, runValidators: true }
    );
    if (!profile) return res.status(404).json({ success: false, message: 'Barber profile not found' });
    res.status(200).json({ success: true, message: 'Service added', services: profile.services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeService = async (req, res) => {
  try {
    const profile = await BarberProfile.findByIdAndUpdate(
      req.params.id,
      { $pull: { services: { _id: req.params.serviceId } } },
      { new: true }
    );
    if (!profile) return res.status(404).json({ success: false, message: 'Barber profile not found' });
    res.status(200).json({ success: true, message: 'Service removed', services: profile.services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



