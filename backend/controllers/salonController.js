import Salon from '../models/Salon.js';

// @desc    Get all salons
// @route   GET /api/salons
// @access  Public
export const getSalons = async (req, res) => {
  try {
    const { keyword, city, state, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = {};
    if (keyword) {
      query.name = { $regex: keyword, $options: 'i' };
    }
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }
    if (state) {
      query.state = { $regex: state, $options: 'i' };
    }

    // Pagination setup
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;

    const total = await Salon.countDocuments(query);
    const salons = await Salon.find(query).skip(startIndex).limit(limitNum);

    res.status(200).json({
      success: true,
      count: salons.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: salons,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single salon
// @route   GET /api/salons/:id
// @access  Public
export const getSalon = async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.id).populate('owner', 'name email');
    if (salon) {
      res.status(200).json(salon);
    } else {
      res.status(404).json({ message: 'Salon not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new salon
// @route   POST /api/salons
// @access  Private/SalonOwner, Admin
export const createSalon = async (req, res) => {
  try {
    // Check if owner already has a salon (optional business rule)
    const existingSalon = await Salon.findOne({ owner: req.user._id });
    if (existingSalon && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'Owner already has a salon registered' });
    }

    const newSalon = new Salon({
      ...req.body,
      owner: req.user._id,
    });

    const savedSalon = await newSalon.save();
    res.status(201).json(savedSalon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update salon
// @route   PUT /api/salons/:id
// @access  Private/SalonOwner, Admin
export const updateSalon = async (req, res) => {
  try {
    let salon = await Salon.findById(req.params.id);

    if (!salon) {
      return res.status(404).json({ message: 'Salon not found' });
    }

    // Make sure user is salon owner
    if (salon.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'User not authorized to update this salon' });
    }

    salon = await Salon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(salon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete salon
// @route   DELETE /api/salons/:id
// @access  Private/SalonOwner, Admin
export const deleteSalon = async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.id);

    if (!salon) {
      return res.status(404).json({ message: 'Salon not found' });
    }

    // Make sure user is salon owner
    if (salon.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'User not authorized to delete this salon' });
    }

    await Salon.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Salon removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get salons within a radius
// @route   GET /api/salons/nearby
// @access  Public
export const getNearbySalons = async (req, res) => {
  try {
    const { lat, lng, distance = 10 } = req.query; // distance in kilometers

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Please provide latitude and longitude' });
    }

    // Convert distance to radians. Divide distance by radius of Earth (6371 km)
    const radius = distance / 6371;

    const salons = await Salon.find({
      location: {
        $geoWithin: { $centerSphere: [[lng, lat], radius] },
      },
    });

    res.status(200).json({
      success: true,
      count: salons.length,
      data: salons,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
