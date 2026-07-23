import Favorite from '../models/Favorite.js';

// ─── Toggle Favorite ──────────────────────────────────────────────────────────

// @desc    Toggle favorite salon or barber (add if not exists, remove if exists)
// @route   POST /api/favorites/toggle
// @access  Private/Customer
export const toggleFavorite = async (req, res) => {
  try {
    const { salon, barber } = req.body;

    if (!salon && !barber) {
      return res.status(400).json({ message: 'Please provide a salon or barber to favorite' });
    }

    const filter = { customer: req.user._id };
    if (salon) filter.salon = salon;
    if (barber) filter.barber = barber;

    const existing = await Favorite.findOne(filter);

    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      return res.status(200).json({ isFavorited: false, message: 'Removed from favorites' });
    }

    const favorite = await Favorite.create({
      customer: req.user._id,
      salon: salon || undefined,
      barber: barber || undefined,
    });

    res.status(201).json({ isFavorited: true, message: 'Added to favorites', data: favorite });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ─── Get My Favorites ─────────────────────────────────────────────────────────

// @desc    Get logged-in customer's favorite salons
// @route   GET /api/favorites/salons
// @access  Private/Customer
export const getFavoriteSalons = async (req, res) => {
  try {
    const favorites = await Favorite.find({
      customer: req.user._id,
      salon: { $exists: true, $ne: null },
    }).populate('salon', 'name address city state images rating totalReviews phone');

    res.status(200).json({ count: favorites.length, data: favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in customer's favorite barbers
// @route   GET /api/favorites/barbers
// @access  Private/Customer
export const getFavoriteBarbers = async (req, res) => {
  try {
    const favorites = await Favorite.find({
      customer: req.user._id,
      barber: { $exists: true, $ne: null },
    }).populate('barber', 'name profilePhoto specialization experience rating totalReviews salonId');

    res.status(200).json({ count: favorites.length, data: favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check if a salon/barber is favorited by current user
// @route   GET /api/favorites/check?salon=id  or  ?barber=id
// @access  Private/Customer
export const checkFavorite = async (req, res) => {
  try {
    const { salon, barber } = req.query;

    if (!salon && !barber) {
      return res.status(400).json({ message: 'Please provide salon or barber query param' });
    }

    const filter = { customer: req.user._id };
    if (salon) filter.salon = salon;
    if (barber) filter.barber = barber;

    const favorite = await Favorite.findOne(filter);
    res.status(200).json({ isFavorited: !!favorite });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
