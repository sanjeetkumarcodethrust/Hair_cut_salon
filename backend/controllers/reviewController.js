import Review from '../models/Review.js';

// ─── Get Reviews ──────────────────────────────────────────────────────────────

// @desc    Get reviews for a salon
// @route   GET /api/salons/:salonId/reviews
// @access  Public
export const getSalonReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ salon: req.params.salonId })
      .populate('customer', 'name profileImage')
      .sort('-createdAt');
    res.status(200).json({ count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reviews for a barber
// @route   GET /api/barbers/:barberId/reviews
// @access  Public
export const getBarberReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ barber: req.params.barberId })
      .populate('customer', 'name profileImage')
      .sort('-createdAt');
    res.status(200).json({ count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Add Review ───────────────────────────────────────────────────────────────

// @desc    Add a review for a salon or barber
// @route   POST /api/reviews
// @access  Private/Customer
export const addReview = async (req, res) => {
  try {
    const { rating, comment, salon, barber } = req.body;

    if (!salon && !barber) {
      return res.status(400).json({ message: 'Please provide a salon or barber to review' });
    }

    // Duplicate check
    const filter = { customer: req.user._id };
    if (salon) filter.salon = salon;
    if (barber) filter.barber = barber;

    const alreadyReviewed = await Review.findOne(filter);
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this' });
    }

    const review = await Review.create({
      customer: req.user._id,
      salon: salon || undefined,
      barber: barber || undefined,
      rating: Number(rating),
      comment,
    });

    const populated = await Review.findById(review._id).populate('customer', 'name profileImage');
    res.status(201).json({ message: 'Review added', data: populated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ─── Update Review ────────────────────────────────────────────────────────────

// @desc    Update own review
// @route   PUT /api/reviews/:id
// @access  Private/Customer
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    review.rating = req.body.rating !== undefined ? Number(req.body.rating) : review.rating;
    review.comment = req.body.comment || review.comment;
    await review.save();

    const populated = await Review.findById(review._id).populate('customer', 'name profileImage');
    res.status(200).json({ message: 'Review updated', data: populated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ─── Delete Review ────────────────────────────────────────────────────────────

// @desc    Delete review (customer who wrote it or admin)
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const isOwner = review.customer.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Keep legacy export for backward compatibility with nested salon route
export const getReviews = getSalonReviews;
