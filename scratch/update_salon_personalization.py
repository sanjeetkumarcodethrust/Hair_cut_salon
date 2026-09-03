import re

with open('backend/controllers/salonController.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports if they don't exist
if 'import Favorite from' not in content:
    content = "import Favorite from '../models/Favorite.js';\nimport RecentlyViewed from '../models/RecentlyViewed.js';\nimport Appointment from '../models/Appointment.js';\n" + content

# Replace scoredCandidates = calculateRelevance(candidates, searchTrimmed);
personalization_logic = """
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
"""

content = content.replace("let scoredCandidates = calculateRelevance(candidates, searchTrimmed);", personalization_logic)

with open('backend/controllers/salonController.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated salonController.js with personalized recommendation scoring")
