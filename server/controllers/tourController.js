const Tour = require('../models/Tour');

/**
 * @desc    Get all tours with advanced filtering
 * @route   GET /api/tours
 * @access  Public
 */
const getTours = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      difficulty,
      minPrice,
      maxPrice,
      featured,
      sort = '-createdAt',
      search,
      country,
      minRating,
      duration,
    } = req.query;

    // Build query
    const query = { isActive: true };

    // Category filter
    if (category) query.category = category;
    
    // Difficulty filter
    if (difficulty) query.difficulty = difficulty;
    
    // Featured filter
    if (featured !== undefined) query.featured = featured === 'true';
    
    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // Duration filter
    if (duration) {
      query.duration = Number(duration);
    }

    // Location/Country filter
    if (country) {
      query['location.country'] = { $regex: country, $options: 'i' };
    }

    // Search filter (search in title, description, and location)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.country': { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
      ];
    }

    // Execute query
    const tours = await Tour.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Tour.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        tours,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        total: count,
      },
    });
  } catch (error) {
    console.error('Get tours error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get tours',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single tour
 * @route   GET /api/tours/:id
 * @access  Public
 */
const getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        tour,
      },
    });
  } catch (error) {
    console.error('Get tour error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get tour',
      error: error.message,
    });
  }
};

/**
 * @desc    Create new tour
 * @route   POST /api/tours
 * @access  Private (Admin/Guide only)
 */
const createTour = async (req, res) => {
  try {
    const tourData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const tour = await Tour.create(tourData);

    res.status(201).json({
      success: true,
      message: 'Tour created successfully',
      data: {
        tour,
      },
    });
  } catch (error) {
    console.error('Create tour error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create tour',
      error: error.message,
    });
  }
};

/**
 * @desc    Update tour
 * @route   PUT /api/tours/:id
 * @access  Private (Admin/Guide only)
 */
const updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tour updated successfully',
      data: {
        tour,
      },
    });
  } catch (error) {
    console.error('Update tour error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tour',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete tour
 * @route   DELETE /api/tours/:id
 * @access  Private (Admin only)
 */
const deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tour deleted successfully',
    });
  } catch (error) {
    console.error('Delete tour error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete tour',
      error: error.message,
    });
  }
};

/**
 * @desc    Get featured tours
 * @route   GET /api/tours/featured
 * @access  Public
 */
const getFeaturedTours = async (req, res) => {
  try {
    const tours = await Tour.find({ featured: true, isActive: true })
      .sort('-rating')
      .limit(4);

    res.status(200).json({
      success: true,
      data: {
        tours,
      },
    });
  } catch (error) {
    console.error('Get featured tours error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get featured tours',
      error: error.message,
    });
  }
};

module.exports = {
  getTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  getFeaturedTours,
};
