const User = require('../models/User');
const Tour = require('../models/Tour');
const Booking = require('../models/Booking');
const Newsletter = require('../models/Newsletter');
const AuditLog = require('../models/AuditLog');
const { sendBookingStatusUpdate } = require('../utils/emailService');

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/admin/stats
 * @access  Private (Admin only)
 */
const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalTours, totalBookings, totalSubscribers] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Tour.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Newsletter.countDocuments(),
    ]);

    // Get additional stats
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    // Get revenue (sum of totalPrice for paid bookings)
    const revenueResult = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalTours,
        totalBookings,
        totalSubscribers,
        pendingBookings,
        confirmedBookings,
        cancelledBookings,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard statistics',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all users with pagination and search
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role } = req.query;

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) query.role = role;

    // Execute query
    const users = await User.find(query)
      .select('-password -refreshTokens')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        total: count,
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all tours (admin view with all fields)
 * @route   GET /api/admin/tours
 * @access  Private (Admin only)
 */
const getAllTours = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category, isActive } = req.query;

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.country': { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Execute query
    const tours = await Tour.find(query)
      .populate('createdBy', 'name email')
      .sort('-createdAt')
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
    console.error('Get all tours error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get tours',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all bookings with search and filters
 * @route   GET /api/admin/bookings
 * @access  Private (Admin only)
 */
const getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, paymentStatus } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

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
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bookings',
      error: error.message,
    });
  }
};

/**
 * @desc    Update booking status
 * @route   PUT /api/admin/bookings/:id/status
 * @access  Private (Admin only)
 */
const updateBookingStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate('tour')
      .populate('user');
      
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    const oldStatus = booking.status;
    const oldPaymentStatus = booking.paymentStatus;

    if (status) booking.status = status;
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    await booking.save();

    // Send email notification if status changed
    if (oldStatus !== booking.status) {
      sendBookingStatusUpdate(booking, booking.user, booking.tour, oldStatus, booking.status)
        .catch(err => console.error('Failed to send email notification:', err));
    }

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: {
        booking,
        statusChanged: oldStatus !== booking.status,
        paymentStatusChanged: oldPaymentStatus !== booking.paymentStatus,
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
 * @desc    Get analytics data for dashboard charts
 * @route   GET /api/admin/analytics
 * @access  Private (Admin only)
 */
const getAnalytics = async (req, res) => {
  try {
    const { period = '7days' } = req.query;

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
      case '1year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }

    // Get bookings trend
    const bookingsTrend = await Booking.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get bookings by status
    const bookingsByStatus = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get popular tours
    const popularTours = await Booking.aggregate([
      {
        $group: {
          _id: '$tour',
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { bookings: -1 } },
      { $limit: 5 },
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
          revenue: 1,
        },
      },
    ]);

    // Get tours by category
    const toursByCategory = await Tour.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        bookingsTrend,
        bookingsByStatus,
        popularTours,
        toursByCategory,
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics data',
      error: error.message,
    });
  }
};

/**
 * @desc    Get audit logs
 * @route   GET /api/admin/audit-logs
 * @access  Private (Admin only)
 */
const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, action, resource, userId } = req.query;

    // Build query
    const query = {};
    if (action) query.action = action;
    if (resource) query.resource = resource;
    if (userId) query.user = userId;

    // Execute query
    const logs = await AuditLog.find(query)
      .populate('user', 'name email role')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await AuditLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        logs,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        total: count,
      },
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get audit logs',
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllTours,
  getAllBookings,
  updateBookingStatus,
  getAnalytics,
  getAuditLogs,
};
