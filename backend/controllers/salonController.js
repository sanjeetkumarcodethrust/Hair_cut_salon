import Favorite from '../models/Favorite.js';
import RecentlyViewed from '../models/RecentlyViewed.js';
import Appointment from '../models/Appointment.js';
import { calculateRelevance } from '../services/relevanceService.js';
import Salon from '../models/Salon.js';
import Review from '../models/Review.js';

// @desc    Get all salons with search/filter/pagination
// @route   GET /api/salons?search=&city=&service=&minRating=&page=&limit=
// @access  Public
export const getSalons = async (req, res) => {
  try {
    const {
      search,
      keyword,    // alias kept for backward compat
      city,
      location,
      service,
      minRating,
      page = 1,
      limit = 10,
    } = req.query;

    const searchTerm = search || keyword;

    // Build query dynamically — no hardcoded city/state
    const query = { verificationStatus: 'approved', isActive: true };

    if (searchTerm) {
      query.name = { $regex: searchTerm, $options: 'i' };
    }

    if (city) {
      query.city = { $regex: city.trim(), $options: 'i' };
    }

    if (location) {
      const locationRegex = { $regex: location.trim(), $options: 'i' };
      query.$or = [
        { address: locationRegex },
        { city: locationRegex },
        { state: locationRegex },
      ];
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

// @desc    Get single salon with profile data (distance, reviews)
// @route   GET /api/salons/:id?latitude=&longitude=
// @access  Public
export const getSalon = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    
    // Use lean() for easier manipulation if needed, or just convert to object later.
    const salonDoc = await Salon.findById(req.params.id).populate('owner', 'name email').populate('business', 'name logo').populate('business', 'name logo');

    if (!salonDoc) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }
    
    const salon = salonDoc.toObject();

    // 1. Calculate Starting Price
    let startingPrice = null;
    if (salon.services && salon.services.length > 0) {
      startingPrice = Math.min(...salon.services.map(s => s.price));
    }
    salon.startingPrice = startingPrice;
    salon.currency = 'INR';

    // 2. Calculate Distance if user location provided
    if (latitude && longitude && salon.location?.coordinates) {
      const lat1 = parseFloat(latitude);
      const lon1 = parseFloat(longitude);
      const lon2 = salon.location.coordinates[0];
      const lat2 = salon.location.coordinates[1];
      
      // Haversine formula
      const R = 6371e3; // metres
      const phi1 = lat1 * Math.PI/180; // φ, λ in radians
      const phi2 = lat2 * Math.PI/180;
      const deltaPhi = (lat2-lat1) * Math.PI/180;
      const deltaLambda = (lon2-lon1) * Math.PI/180;

      const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
                Math.cos(phi1) * Math.cos(phi2) *
                Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      salon.distanceMeters = R * c; // in metres
    }

    // 3. Fetch Preview Reviews (e.g. latest 5)
    const reviews = await Review.find({ salon: salon._id })
      .populate('customer', 'name profilePic')
      .sort({ createdAt: -1 })
      .limit(5);
      
    salon.reviewsPreview = reviews;

    res.status(200).json({ success: true, data: salon });
  } catch (error) {
    if (error.kind === 'ObjectId') {
       return res.status(404).json({ success: false, message: 'Shop not found' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSalon = async (req, res) => {
  try {
    const newSalon = new Salon({
      ...req.body,
      city: req.body.city || 'Pune',
      state: req.body.state || 'Maharashtra',
      owner: req.user._id,
    });

    const savedSalon = await newSalon.save();
    res.status(201).json({ success: true, data: savedSalon, _id: savedSalon._id });
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

// @desc    Get salons within a radius (Smart Search & Relevance)
// @route   GET /api/salons/nearby?latitude=&longitude=&radius=&search=&sort=&page=&limit=
// @access  Public


export const getNearbySalons = async (req, res) => {
  try {
    const { 
      latitude, longitude, radius = 5000, 
      search = '', sort = 'relevance', 
      page = 1, limit = 10,
      minPrice, maxPrice, minRating, offersOnly
    } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Please provide latitude and longitude' });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    let rad = radius === 'any' ? 100000 : parseFloat(radius);

    if (isNaN(lat) || isNaN(lng) || isNaN(rad) || rad <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid location parameters' });
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(parseInt(limit, 10) || 10, 50);
    const skip = (pageNum - 1) * limitNum;

    // 1. Geospatial Candidate Search
    const pipeline = [
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distanceMeters',
          maxDistance: rad,
          spherical: true,
        },
      }
    ];

    // 2. Add Search Matching (Text filter)
    const searchTrimmed = search.trim();
    if (searchTrimmed) {
      const regex = new RegExp(searchTrimmed, 'i');
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: regex } },
            { description: { $regex: regex } },
            { 'services.name': { $regex: regex } },
            { 'services.description': { $regex: regex } },
            { city: { $regex: regex } },
            { address: { $regex: regex } }
          ]
        }
      });
    }

    // Rating Filter
    if (minRating) {
      const mRating = parseFloat(minRating);
      if (!isNaN(mRating)) {
         pipeline.push({ $match: { rating: { $gte: mRating } } });
      }
    }

    // Offers Filter
    if (offersOnly === 'true') {
       pipeline.push({ $match: { "activeOffer.isActive": true } });
    }

    // Calculate starting price FIRST so we can filter by it
    pipeline.push({
      $addFields: {
        startingPrice: {
          $min: {
            $map: {
              input: { $ifNull: ["$services", []] },
              as: "service",
              in: "$$service.price"
            }
          }
        },
        currency: "INR"
      }
    });

    // Price Filter (After starting price is calculated)
    const priceMatch = {};
    if (minPrice) {
      const minP = parseFloat(minPrice);
      if (!isNaN(minP)) priceMatch['$gte'] = minP;
    }
    if (maxPrice) {
      const maxP = parseFloat(maxPrice);
      if (!isNaN(maxP)) priceMatch['$lte'] = maxP;
    }
    
    if (Object.keys(priceMatch).length > 0) {
      pipeline.push({ $match: { startingPrice: priceMatch } });
    }

    // Run pipeline
    const candidates = await Salon.aggregate(pipeline);
    
    // 3. Normalize Ranking Signals & Calculate Relevance
    
    let scoredCandidates = calculateRelevance(candidates, searchTrimmed);

    if (req.user && sort === 'relevance' && !searchTrimmed) {
        const customerId = req.user._id;
        const [favorites, recentViews, bookings] = await Promise.all([
          Favorite.find({ customer: customerId, type: 'shop' }).distinct('shop'),
          RecentlyViewed.find({ customer: customerId, entityType: 'shop' }).sort({ viewedAt: -1 }).limit(10).distinct('shop'),
          Appointment.find({ customer: customerId, status: 'completed' }).distinct('salon')
        ]);
        const favSet = new Set(favorites.map(id => id.toString()));
        const recentSet = new Set(recentViews.map(id => id.toString()));
        const bookedSet = new Set(bookings.map(id => id.toString()));

        scoredCandidates = scoredCandidates.map(salon => {
            const shopIdStr = salon._id.toString();
            if (bookedSet.has(shopIdStr)) salon.relevanceScore += 50;
            if (favSet.has(shopIdStr)) salon.relevanceScore += 30;
            if (recentSet.has(shopIdStr)) salon.relevanceScore += 10;
            return salon;
        });
    }


    // 4. Sort
    if (sort === 'distance') {
      scoredCandidates.sort((a, b) => a.distanceMeters - b.distanceMeters || b.rating - a.rating);
    } else if (sort === 'rating') {
      scoredCandidates.sort((a, b) => b.rating - a.rating || b.totalReviews - a.totalReviews || a.distanceMeters - b.distanceMeters);
    } else if (sort === 'priceAsc') {
      scoredCandidates.sort((a, b) => a.startingPrice - b.startingPrice || b.rating - a.rating || a.distanceMeters - b.distanceMeters);
    } else if (sort === 'priceDesc') {
      scoredCandidates.sort((a, b) => b.startingPrice - a.startingPrice || b.rating - a.rating || a.distanceMeters - b.distanceMeters);
    } else {
      // Default: relevance
      scoredCandidates.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    // 5. Pagination
    const total = scoredCandidates.length;
    const paginatedSalons = scoredCandidates.slice(skip, skip + limitNum);
    
    // Populate owner info
    await Salon.populate(paginatedSalons, { path: 'owner', select: 'name email' });

    const hasMore = (skip + paginatedSalons.length) < total;

    const appliedFilters = {
      radius: rad, minPrice, maxPrice, minRating, offersOnly, search, sort
    };

    res.status(200).json({
      success: true,
      count: paginatedSalons.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      hasMore,
      appliedFilters,
      data: paginatedSalons,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
import { getAvailableSlots } from '../services/availabilityService.js';

// @desc    Get real-time availability for a shop
// @route   GET /api/salons/:id/availability?date=&serviceId=
// @access  Public
export const getShopAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, serviceId, serviceIds, excludeBookingId } = req.query;

    if (!date || (!serviceId && !serviceIds)) {
      return res.status(400).json({ success: false, message: 'Date and serviceId(s) are required' });
    }

    const shop = await Salon.findById(id).lean();
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    let services = [];
    if (serviceIds) {
      const ids = serviceIds.split(',');
      services = shop.services.filter(s => ids.includes(s._id.toString()));
      if (services.length === 0) {
        return res.status(404).json({ success: false, message: 'Services not found in this shop' });
      }
    } else {
      const service = shop.services.find(s => s._id.toString() === serviceId);
      if (!service) {
        return res.status(404).json({ success: false, message: 'Service not found in this shop' });
      }
      services = [service];
    }

    const slots = await getAvailableSlots(id, date, services, 'Asia/Kolkata', excludeBookingId);

    res.status(200).json({
      success: true,
      shopId: id,
      date,
      services: services.map(s => ({
        id: s._id,
        name: s.name,
        duration: s.duration
      })),
      slots
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
