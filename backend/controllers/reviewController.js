import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Appointment from '../models/Appointment.js';
import Salon from '../models/Salon.js';
import BarberProfile from '../models/BarberProfile.js';

const updateSalonRating = async (salonId) => {
  const result = await Review.aggregate([
    { $match: { salon: new mongoose.Types.ObjectId(salonId), status: 'published' } },
    {
      $group: {
        _id: '$salon',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const rating = result.length > 0 ? Math.round(result[0].averageRating * 10) / 10 : 0;
  const totalReviews = result.length > 0 ? result[0].totalReviews : 0;

  await Salon.findByIdAndUpdate(salonId, { rating, totalReviews });
};

const updateBarberRating = async (barberId) => {
  if (!barberId) return;
  const result = await Review.aggregate([
    { $match: { barber: new mongoose.Types.ObjectId(barberId), status: 'published' } },
    {
      $group: {
        _id: '$barber',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const rating = result.length > 0 ? Math.round(result[0].averageRating * 10) / 10 : 0;
  const totalReviews = result.length > 0 ? result[0].totalReviews : 0;

  await BarberProfile.findByIdAndUpdate(barberId, { rating, totalReviews });
};

export const createReview = async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({ message: 'Valid rating between 1 and 5 is required' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (appointment.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to review this appointment' });
    }

    if (appointment.status !== 'completed') {
      return res.status(400).json({ message: 'Only completed appointments can be reviewed' });
    }

    const existingReview = await Review.findOne({ appointment: appointmentId });
    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this appointment' });
    }

    let sanitizedComment = comment ? comment.trim().substring(0, 500) : '';

    const review = await Review.create({
      customer: req.user._id,
      salon: appointment.salon,
      barber: appointment.barber,
      appointment: appointment._id,
      serviceId: appointment.serviceId,
      serviceName: appointment.service?.name,
      rating,
      comment: sanitizedComment,
    });

    await updateSalonRating(appointment.salon);
    await updateBarberRating(appointment.barber);

    res.status(201).json(review);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Review already exists for this appointment' });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getSalonReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { salon: req.params.id, status: 'published' };

    const reviews = await Review.find(query)
      .populate('customer', 'name profilePhoto')
      .populate('barber', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(query);

    res.status(200).json({
      reviews,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ customer: req.user._id })
      .populate('salon', 'name address')
      .populate('barber', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const editReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (rating && (rating < 1 || rating > 5 || !Number.isInteger(rating))) {
      return res.status(400).json({ message: 'Valid rating between 1 and 5 is required' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this review' });
    }

    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment.trim().substring(0, 500);

    await review.save();

    await updateSalonRating(review.salon);
    await updateBarberRating(review.barber);

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await review.deleteOne();

    await updateSalonRating(review.salon);
    await updateBarberRating(review.barber);

    res.status(200).json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reportReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.status = 'reported';
    await review.save();

    await updateSalonRating(review.salon);
    await updateBarberRating(review.barber);

    res.status(200).json({ message: 'Review reported successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
