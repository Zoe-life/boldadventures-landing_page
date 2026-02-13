const Review = require('../models/Review');
const Tour = require('../models/Tour');
const Booking = require('../models/Booking');

/**
 * @desc    Create a review for a tour
 * @route   POST /api/reviews
 * @access  Private
 */
const createReview = async (req, res) => {
  try {
    const { tour, rating, comment } = req.body;

    // Check if tour exists
    const tourExists = await Tour.findById(tour);
    if (!tourExists) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found',
      });
    }

    // Check if user has already reviewed this tour
    const existingReview = await Review.findOne({
      tour,
      user: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this tour',
      });
    }

    // Optional: Check if user has booked this tour (uncomment to enforce)
    // const hasBooked = await Booking.findOne({
    //   tour,
    //   user: req.user._id,
    //   status: 'confirmed',
    // });
    // 
    // if (!hasBooked) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'You can only review tours you have booked',
    //   });
    // }

    // Create review
    const review = await Review.create({
      tour,
      user: req.user._id,
      rating,
      comment,
    });

    // Populate user info
    await review.populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: {
        review,
      },
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all reviews for a tour
 * @route   GET /api/reviews/tour/:tourId
 * @access  Public
 */
const getTourReviews = async (req, res) => {
  try {
    const { tourId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get approved reviews only
    const reviews = await Review.find({ tour: tourId, isApproved: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Review.countDocuments({ tour: tourId, isApproved: true });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get tour reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reviews',
      error: error.message,
    });
  }
};

/**
 * @desc    Get user's reviews
 * @route   GET /api/reviews/my-reviews
 * @access  Private
 */
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('tour', 'title coverImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        reviews,
      },
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reviews',
      error: error.message,
    });
  }
};

/**
 * @desc    Update a review
 * @route   PUT /api/reviews/:id
 * @access  Private
 */
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Find review
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews',
      });
    }

    // Update review
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();

    await review.populate('user', 'name avatar');

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: {
        review,
      },
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Check if user owns the review or is admin
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews',
      });
    }

    await Review.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all reviews (Admin only)
 * @route   GET /api/reviews
 * @access  Private/Admin
 */
const getAllReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const reviews = await Review.find()
      .populate('tour', 'title')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Review.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reviews',
      error: error.message,
    });
  }
};

module.exports = {
  createReview,
  getTourReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  getAllReviews,
};
