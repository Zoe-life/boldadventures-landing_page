const Tour = require('../models/Tour');
const Booking = require('../models/Booking');

/**
 * @desc    Get guide dashboard statistics
 * @route   GET /api/guide/stats
 * @access  Private (Guide only)
 */
const getGuideDashboardStats = async (req, res) => {
  try {
    // Get tours created by this guide
    const myTours = await Tour.find({ createdBy: req.user._id, isActive: true });
    const myTourIds = myTours.map((tour) => tour._id);

    // Get bookings for guide's tours
    const totalBookings = await Booking.countDocuments({
      tour: { $in: myTourIds },
    });

    const upcomingBookings = await Booking.countDocuments({
      tour: { $in: myTourIds },
      status: { $in: ['pending', 'confirmed'] },
      startDate: { $gte: new Date() },
    });

    // Calculate total participants
    const participantsResult = await Booking.aggregate([
      {
        $match: {
          tour: { $in: myTourIds },
          status: { $in: ['confirmed', 'completed'] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$numberOfPeople' },
        },
      },
    ]);
    const totalParticipants = participantsResult.length > 0 ? participantsResult[0].total : 0;

    // Calculate revenue for guide's tours
    const revenueResult = await Booking.aggregate([
      {
        $match: {
          tour: { $in: myTourIds },
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' },
        },
      },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        myToursCount: myTours.length,
        totalBookings,
        upcomingBookings,
        totalParticipants,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error('Get guide dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard statistics',
      error: error.message,
    });
  }
};

/**
 * @desc    Get guide's tours with pagination
 * @route   GET /api/guide/tours
 * @access  Private (Guide only)
 */
const getMyTours = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category } = req.query;

    // Build query for tours created by this guide
    const query = { createdBy: req.user._id };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = category;

    // Execute query
    const tours = await Tour.find(query)
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Tour.countDocuments(query);

    // Get booking counts for each tour
    const toursWithBookings = await Promise.all(
      tours.map(async (tour) => {
        const bookingCount = await Booking.countDocuments({
          tour: tour._id,
          status: { $in: ['pending', 'confirmed'] },
        });
        return {
          ...tour.toObject(),
          activeBookings: bookingCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        tours: toursWithBookings,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        total: count,
      },
    });
  } catch (error) {
    console.error('Get my tours error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get tours',
      error: error.message,
    });
  }
};

/**
 * @desc    Get bookings for guide's tours
 * @route   GET /api/guide/bookings
 * @access  Private (Guide only)
 */
const getMyBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status } = req.query;

    // Get tours created by this guide
    const myTours = await Tour.find({ createdBy: req.user._id });
    const myTourIds = myTours.map((tour) => tour._id);

    // Build query
    const query = { tour: { $in: myTourIds } };
    if (status) query.status = status;

    // If search is provided, we need to search in populated fields
    let bookings;
    let count;

    if (search) {
      // First, find all bookings and populate, then filter
      const allBookings = await Booking.find(query)
        .populate('tour', 'title')
        .populate('user', 'name email')
        .sort('-createdAt')
        .exec();

      // Filter by search term
      const filteredBookings = allBookings.filter(
        (booking) =>
          booking.tour?.title?.toLowerCase().includes(search.toLowerCase()) ||
          booking.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
          booking.user?.email?.toLowerCase().includes(search.toLowerCase())
      );

      count = filteredBookings.length;
      bookings = filteredBookings.slice((page - 1) * limit, page * limit);
    } else {
      // Execute query without search
      bookings = await Booking.find(query)
        .populate('tour', 'title category duration price')
        .populate('user', 'name email')
        .sort('-createdAt')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      count = await Booking.countDocuments(query);
    }

    res.status(200).json({
      success: true,
      data: {
        bookings,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        total: count,
      },
    });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bookings',
      error: error.message,
    });
  }
};

/**
 * @desc    Update booking status (guide can only update their tour bookings)
 * @route   PUT /api/guide/bookings/:id/status
 * @access  Private (Guide only)
 */
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findById(req.params.id).populate('tour');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if the guide owns this tour
    if (booking.tour.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this booking',
      });
    }

    const oldStatus = booking.status;
    booking.status = status;
    await booking.save();

    // TODO: Send email notification to user about status change

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: {
        booking,
        statusChanged: oldStatus !== booking.status,
      },
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: error.message,
    });
  }
};

/**
 * @desc    Get analytics data for guide dashboard
 * @route   GET /api/guide/analytics
 * @access  Private (Guide only)
 */
const getGuideAnalytics = async (req, res) => {
  try {
    const { period = '30days' } = req.query;

    // Get tours created by this guide
    const myTours = await Tour.find({ createdBy: req.user._id });
    const myTourIds = myTours.map((tour) => tour._id);

    // Calculate date range based on period
    const now = new Date();
    let startDate;
    switch (period) {
      case '7days':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case '30days':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case '90days':
        startDate = new Date(now.setDate(now.getDate() - 90));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 30));
    }

    // Get bookings trend for guide's tours
    const bookingsTrend = await Booking.aggregate([
      {
        $match: {
          tour: { $in: myTourIds },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
          participants: { $sum: '$numberOfPeople' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get bookings by status for guide's tours
    const bookingsByStatus = await Booking.aggregate([
      { $match: { tour: { $in: myTourIds } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get performance by tour
    const tourPerformance = await Booking.aggregate([
      { $match: { tour: { $in: myTourIds } } },
      {
        $group: {
          _id: '$tour',
          bookings: { $sum: 1 },
          participants: { $sum: '$numberOfPeople' },
          revenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { bookings: -1 } },
      {
        $lookup: {
          from: 'tours',
          localField: '_id',
          foreignField: '_id',
          as: 'tourDetails',
        },
      },
      { $unwind: '$tourDetails' },
      {
        $project: {
          title: '$tourDetails.title',
          bookings: 1,
          participants: 1,
          revenue: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        bookingsTrend,
        bookingsByStatus,
        tourPerformance,
      },
    });
  } catch (error) {
    console.error('Get guide analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics data',
      error: error.message,
    });
  }
};

module.exports = {
  getGuideDashboardStats,
  getMyTours,
  getMyBookings,
  updateBookingStatus,
  getGuideAnalytics,
};
