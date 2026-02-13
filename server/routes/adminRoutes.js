const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const { auditLogger } = require('../middleware/auditLog');
const {
  getDashboardStats,
  getAllUsers,
  getAllTours,
  getAllBookings,
  updateBookingStatus,
  getAnalytics,
  getAuditLogs,
} = require('../controllers/adminController');

// All routes are protected and restricted to admin only
router.use(protect);
router.use(restrictTo('admin'));

// Dashboard statistics
router.get('/stats', getDashboardStats);

// Users management
router.get('/users', getAllUsers);

// Tours management
router.get('/tours', getAllTours);

// Bookings management
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/status', auditLogger('UPDATE_BOOKING_STATUS', 'BOOKING'), updateBookingStatus);

// Analytics
router.get('/analytics', getAnalytics);

// Audit logs
router.get('/audit-logs', getAuditLogs);

module.exports = router;
