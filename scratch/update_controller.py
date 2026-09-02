import re

with open('backend/controllers/salonController.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace getNearbySalons
new_func = """export const getNearbySalons = async (req, res) => {
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
};"""

start_idx = content.find('export const getNearbySalons = async (req, res) => {')
if start_idx != -1:
    content = content[:start_idx] + new_func
    with open('backend/controllers/salonController.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated getNearbySalons in salonController.js")
else:
    print("Could not find getNearbySalons")
