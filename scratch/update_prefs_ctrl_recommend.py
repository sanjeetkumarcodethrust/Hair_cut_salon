import Salon from '../models/Salon.js';
import Appointment from '../models/Appointment.js';
import Favorite from '../models/Favorite.js';
import RecentlyViewed from '../models/RecentlyViewed.js';

// @desc    Get Personalized Recommendations
// @route   GET /api/preferences/recommended
// @access  Private
export const getRecommendedSalons = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    // Base query for active, approved salons
    const query = { isActive: true, verificationStatus: 'approved' };
    let salons = await Salon.find(query).lean();

    // 1. Fetch user signals
    const customerId = req.user._id;
    const [favorites, recentViews, bookings] = await Promise.all([
      Favorite.find({ customer: customerId, type: 'shop' }).distinct('shop'),
      RecentlyViewed.find({ customer: customerId, entityType: 'shop' }).sort({ viewedAt: -1 }).limit(10).distinct('shop'),
      Appointment.find({ customer: customerId, status: 'completed' }).distinct('salon')
    ]);

    const favSet = new Set(favorites.map(id => id.toString()));
    const recentSet = new Set(recentViews.map(id => id.toString()));
    const bookedSet = new Set(bookings.map(id => id.toString()));

    // 2. Score Salons
    salons = salons.map(salon => {
      let score = 0;
      const shopIdStr = salon._id.toString();

      // Signal boosting
      if (bookedSet.has(shopIdStr)) score += 50;
      if (favSet.has(shopIdStr)) score += 30;
      if (recentSet.has(shopIdStr)) score += 10;

      // Rating boost
      if (salon.rating) score += (salon.rating * 5); // Max 25

      // Offers boost
      if (salon.activeOffer?.isActive) score += 15;

      // Distance decay (if location provided)
      let distance = null;
      if (lat && lng && salon.location?.coordinates) {
        const [shopLng, shopLat] = salon.location.coordinates;
        distance = calculateDistance(lat, lng, shopLat, shopLng);
        salon.distance = distance;
        
        // Decay score by distance (closer is better)
        if (distance < 5) score += 40;
        else if (distance < 10) score += 20;
        else if (distance < 20) score += 5;
        else score -= 20; // penalize far shops
      }

      salon.recommendationScore = score;
      return salon;
    });

    // 3. Sort by score
    salons.sort((a, b) => b.recommendationScore - a.recommendationScore);

    // 4. Return top 10
    res.status(200).json(salons.slice(0, 10));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

function calculateDistance(lat1, lon1, lat2, lon2) {
  const p = 0.017453292519943295;    // Math.PI / 180
  const c = Math.cos;
  const a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;
  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}
