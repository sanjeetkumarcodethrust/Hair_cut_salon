import Favorite from '../models/Favorite.js';
import RecentlyViewed from '../models/RecentlyViewed.js';
import Appointment from '../models/Appointment.js';
import Salon from '../models/Salon.js';

// @desc    Toggle favorite (shop, service, barber)
// @route   POST /api/preferences/favorites/toggle
// @access  Private
export const toggleFavorite = async (req, res) => {
  try {
    const { shopId, serviceId, barberId, type = 'shop' } = req.body;
    
    let query = { customer: req.user._id, type };
    if (shopId) query.shop = shopId;
    if (serviceId) query.service = serviceId;
    if (barberId) query.barber = barberId;

    const existing = await Favorite.findOne(query);

    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      return res.status(200).json({ message: 'Removed from favorites', isFavorite: false });
    } else {
      await Favorite.create(query);
      return res.status(201).json({ message: 'Added to favorites', isFavorite: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get favorites
// @route   GET /api/preferences/favorites
// @access  Private
export const getFavorites = async (req, res) => {
  try {
    const { type = 'shop' } = req.query;
    const favorites = await Favorite.find({ customer: req.user._id, type }).populate('shop').sort({ createdAt: -1 });
    res.status(200).json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Record a view
// @route   POST /api/preferences/recent
// @access  Private
export const recordView = async (req, res) => {
  try {
    const { shopId, serviceId, type = 'shop' } = req.body;
    
    let query = { customer: req.user._id, entityType: type };
    if (shopId) query.shop = shopId;
    if (serviceId) query.service = serviceId;

    // Upsert the view record
    await RecentlyViewed.findOneAndUpdate(
      query,
      { $set: { viewedAt: new Date() } },
      { upsert: true, new: true }
    );

    // Keep only last 20
    const views = await RecentlyViewed.find({ customer: req.user._id, entityType: type }).sort({ viewedAt: -1 }).skip(20);
    if (views.length > 0) {
      const idsToDelete = views.map(v => v._id);
      await RecentlyViewed.deleteMany({ _id: { $in: idsToDelete } });
    }

    res.status(200).json({ message: 'View recorded' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recently viewed
// @route   GET /api/preferences/recent
// @access  Private
export const getRecentlyViewed = async (req, res) => {
  try {
    const { type = 'shop' } = req.query;
    const views = await RecentlyViewed.find({ customer: req.user._id, entityType: type })
      .populate('shop')
      .sort({ viewedAt: -1 });
    res.status(200).json(views);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear recently viewed
// @route   DELETE /api/preferences/recent
// @access  Private
export const clearRecentlyViewed = async (req, res) => {
  try {
    const { type = 'shop' } = req.query;
    await RecentlyViewed.deleteMany({ customer: req.user._id, entityType: type });
    res.status(200).json({ message: 'History cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Personalized Recommendations
// @route   GET /api/preferences/recommended
// @access  Private
export const getRecommendedSalons = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    const query = { isActive: true, verificationStatus: 'approved' };
    let salons = await Salon.find(query).lean();

    const customerId = req.user._id;
    const [favorites, recentViews, bookings] = await Promise.all([
      Favorite.find({ customer: customerId, type: 'shop' }).distinct('shop'),
      RecentlyViewed.find({ customer: customerId, entityType: 'shop' }).sort({ viewedAt: -1 }).limit(10).distinct('shop'),
      Appointment.find({ customer: customerId, status: 'completed' }).distinct('salon')
    ]);

    const favSet = new Set(favorites.map(id => id.toString()));
    const recentSet = new Set(recentViews.map(id => id.toString()));
    const bookedSet = new Set(bookings.map(id => id.toString()));

    salons = salons.map(salon => {
      let score = 0;
      const shopIdStr = salon._id.toString();

      if (bookedSet.has(shopIdStr)) score += 50;
      if (favSet.has(shopIdStr)) score += 30;
      if (recentSet.has(shopIdStr)) score += 10;

      if (salon.rating) score += (salon.rating * 5); 

      if (salon.activeOffer?.isActive) score += 15;

      let distance = null;
      if (lat && lng && salon.location?.coordinates) {
        const [shopLng, shopLat] = salon.location.coordinates;
        distance = calculateDistance(lat, lng, shopLat, shopLng);
        salon.distance = distance;
        
        if (distance < 5) score += 40;
        else if (distance < 10) score += 20;
        else if (distance < 20) score += 5;
        else score -= 20; 
      }

      salon.recommendationScore = score;
      return salon;
    });

    salons.sort((a, b) => b.recommendationScore - a.recommendationScore);

    res.status(200).json(salons.slice(0, 10));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

function calculateDistance(lat1, lon1, lat2, lon2) {
  const p = 0.017453292519943295;
  const c = Math.cos;
  const a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;
  return 12742 * Math.asin(Math.sqrt(a));
}
