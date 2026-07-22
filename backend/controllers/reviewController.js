import Review from '../models/Review.js';

// @desc    Get reviews for a salon
// @route   GET /api/salons/:salonId/reviews
// @access  Public
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ salon: req.params.salonId })
      .populate('customer', 'name avatar')
      .sort('-createdAt');
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add review
// @route   POST /api/salons/:salonId/reviews
// @access  Private
export const addReview = async (req, res) => {
  try {
    const { rating, comment, barber } = req.body;
    const salon = req.params.salonId;
    const customer = req.user._id;

    // Check if user already submitted a review
    const alreadyReviewed = await Review.findOne({ salon, customer });
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Salon already reviewed' });
    }

    const review = new Review({
      salon,
      customer,
      barber,
      rating: Number(rating),
      comment,
    });

    await review.save();
    res.status(201).json({ message: 'Review added' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
