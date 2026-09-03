import re

with open('backend/controllers/adminController.js', 'r', encoding='utf-8') as f:
    content = f.read()

admin_reviews = """
// @desc    Get all reviews (for moderation)
// @route   GET /api/admin/reviews
export const getAdminReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status; // 'published', 'hidden', 'reported'

    const reviews = await Review.find(query)
      .populate('customer', 'name email')
      .populate('salon', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Review.countDocuments(query);

    res.status(200).json({ reviews, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Moderate Review
// @route   PUT /api/admin/reviews/:id/moderate
export const moderateReview = async (req, res) => {
  try {
    const { status, reason } = req.body;
    if (!['published', 'hidden', 'reported'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const previousStatus = review.status;
    review.status = status;
    await review.save();

    // Recalculate aggregates if it was hidden or published
    const { updateSalonRating, updateBarberRating } = await import('./reviewController.js');
    await updateSalonRating(review.salon);
    await updateBarberRating(review.barber);

    await logAdminAction(req.user._id, `Moderate Review to ${status}`, 'Review', review._id, reason, { status: previousStatus }, { status: review.status });

    res.status(200).json({ message: `Review ${status} successfully`, review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
"""

content = content + "\n" + admin_reviews

with open('backend/controllers/adminController.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated adminController.js with Review Moderation")
