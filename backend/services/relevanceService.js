export const RELEVANCE_WEIGHTS = {
  search: 45,       // Search exact/partial match
  distance: 25,     // Proximity
  rating: 15,       // High rating
  reviews: 10,      // Confidence/Review volume
  availability: 5,  // Open status
  popularity: 0     // To be implemented in later phases
};

const calculateSearchScore = (salon, searchLower) => {
  if (!searchLower) return 0;
  
  let score = 0;
  const name = salon.name?.toLowerCase() || '';
  const desc = salon.description?.toLowerCase() || '';
  
  // Exact name match
  if (name === searchLower) return 100;
  // Name starts with
  if (name.startsWith(searchLower)) return 85;
  // Name contains
  if (name.includes(searchLower)) score = 70;
  
  // Service match
  if (score < 100 && salon.services && Array.isArray(salon.services)) {
    const serviceMatch = salon.services.find(s => {
      const sName = s.name?.toLowerCase() || '';
      return sName === searchLower || sName.includes(searchLower);
    });
    if (serviceMatch && score < 75) score = 75; 
  }
  
  // Description match
  if (score < 50 && desc.includes(searchLower)) {
    score = 40;
  }
  
  return score;
};

const calculateDistanceScore = (distanceMeters) => {
  const distanceKm = distanceMeters / 1000;
  if (distanceKm <= 0.5) return 100;
  if (distanceKm <= 1) return 90;
  if (distanceKm <= 2) return 75;
  if (distanceKm <= 3) return 60;
  if (distanceKm <= 5) return 40;
  if (distanceKm <= 10) return 20;
  return 0;
};

const calculateRatingScore = (rating) => {
  if (!rating || rating === 0) return 0;
  return (rating / 5) * 100;
};

const calculateReviewScore = (totalReviews) => {
  if (!totalReviews || totalReviews === 0) return 0;
  if (totalReviews > 500) return 100;
  if (totalReviews > 100) return 80;
  if (totalReviews > 50) return 60;
  if (totalReviews > 10) return 40;
  return 20;
};

const calculateAvailabilityScore = (openingHours) => {
  if (!openingHours) return 0;
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[new Date().getDay()];
  
  const todayHours = openingHours[today];
  if (todayHours && todayHours.isClosed === false) {
    return 100; 
  }
  return 0;
};

export const calculateRelevance = (salons, searchQuery) => {
  const searchLower = searchQuery ? searchQuery.trim().toLowerCase() : '';
  const searchExists = !!searchLower;
  
  const scoredSalons = salons.map(salon => {
    const searchScore = calculateSearchScore(salon, searchLower);
    const distanceScore = calculateDistanceScore(salon.distanceMeters);
    const ratingScore = calculateRatingScore(salon.rating);
    const reviewScore = calculateReviewScore(salon.totalReviews);
    const availabilityScore = calculateAvailabilityScore(salon.openingHours);
    
    let finalScore = 0;
    if (searchExists) {
      if (searchScore > 0) {
        finalScore = 
          (searchScore * (RELEVANCE_WEIGHTS.search / 100)) +
          (distanceScore * (RELEVANCE_WEIGHTS.distance / 100)) +
          (ratingScore * (RELEVANCE_WEIGHTS.rating / 100)) +
          (reviewScore * (RELEVANCE_WEIGHTS.reviews / 100)) +
          (availabilityScore * (RELEVANCE_WEIGHTS.availability / 100));
      } else {
        finalScore = 0; // Filter out irrelevant results when searching
      }
    } else {
       // No search query. Redistribute weights
       const noSearchWeights = {
         distance: 55,
         rating: 25,
         reviews: 15,
         availability: 5
       };
       finalScore = 
          (distanceScore * (noSearchWeights.distance / 100)) +
          (ratingScore * (noSearchWeights.rating / 100)) +
          (reviewScore * (noSearchWeights.reviews / 100)) +
          (availabilityScore * (noSearchWeights.availability / 100));
    }
    
    return {
      ...salon,
      relevanceScore: finalScore
    };
  });

  // If search exists, filter out zero score (unrelated) results
  return searchExists 
    ? scoredSalons.filter(s => s.relevanceScore > 0)
    : scoredSalons;
};
