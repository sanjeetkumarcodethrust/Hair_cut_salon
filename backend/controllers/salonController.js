import Salon from '../models/Salon.js';

// @desc    Get all salons with search/filter/pagination
// @route   GET /api/salons?search=&city=&service=&minRating=&page=&limit=
// @access  Public
export const getSalons = async (req, res) => {
  try {
    const {
      search,
      keyword,    // alias kept for backward compat
      city,
      service,
      minRating,
      page = 1,
      limit = 10,
    } = req.query;

    const searchTerm = search || keyword;

    // Build query dynamically — no hardcoded city/state
    const query = {};

    if (searchTerm) {
      query.name = { $regex: searchTerm, $options: 'i' };
    }

    if (city) {
      query.city = { $regex: city.trim(), $options: 'i' };
    }

    if (service) {
      // Match salons that have a service whose name contains the search term
      query['services.name'] = { $regex: service.trim(), $options: 'i' };
    }

    if (minRating) {
      const rating = parseFloat(minRating);
      if (!isNaN(rating)) {
        query.rating = { $gte: rating };
      }
    }

    // Pagination
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(parseInt(limit, 10) || 10, 50); // cap at 50
    const startIndex = (pageNum - 1) * limitNum;

    const total = await Salon.countDocuments(query);
    const salons = await Salon.find(query)
      .skip(startIndex)
      .limit(limitNum)
      .sort({ rating: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: salons.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: salons,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single salon
// @route   GET /api/salons/:id
// @access  Public
export const getSalon = async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.id).populate('owner', 'name email');

    if (!salon) {
      return res.status(404).json({ success: false, message: 'Salon not found' });
    }

    res.status(200).json({ success: true, data: salon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new salon
// @route   POST /api/salons
// @access  Private/Owner, Admin
export const createSalon = async (req, res) => {
  try {
    // Check if owner already has a salon (optional business rule)
    const existingSalon = await Salon.findOne({ owner: req.user._id });
    if (existingSalon && req.user.role !== 'admin') {
      return res.status(409).json({ success: false, message: 'Owner already has a salon registered' });
    }

    const newSalon = new Salon({
      ...req.body,
      owner: req.user._id,
    });

    const savedSalon = await newSalon.save();
    res.status(201).json({ success: true, data: savedSalon });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update salon
// @route   PUT /api/salons/:id
// @access  Private/Owner, Admin
export const updateSalon = async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.id);

    if (!salon) {
      return res.status(404).json({ success: false, message: 'Salon not found' });
    }

    // Make sure user is the salon owner or admin
    if (salon.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this salon' });
    }

    const updated = await Salon.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete salon
// @route   DELETE /api/salons/:id
// @access  Private/Owner, Admin
export const deleteSalon = async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.id);

    if (!salon) {
      return res.status(404).json({ success: false, message: 'Salon not found' });
    }

    // Make sure user is the salon owner or admin
    if (salon.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this salon' });
    }

    await Salon.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Salon removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get salons within a radius
// @route   GET /api/salons/nearby?lat=&lng=&distance=
// @access  Public
export const getNearbySalons = async (req, res) => {
  try {
    const { lat, lng, distance = 10 } = req.query; // distance in km

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Please provide latitude and longitude' });
    }

    // Convert distance to radians (Earth radius = 6371 km)
    const radius = parseFloat(distance) / 6371;

    const salons = await Salon.find({
      location: {
        $geoWithin: { $centerSphere: [[parseFloat(lng), parseFloat(lat)], radius] },
      },
    });

    res.status(200).json({
      success: true,
      count: salons.length,
      data: salons,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
