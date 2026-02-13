const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const { auditLogger } = require('../middleware/auditLog');
const {
  getGuideDashboardStats,
  getMyTours,
  getMyBookings,
  updateBookingStatus,
  getGuideAnalytics,
} = require('../controllers/guideController');

// All routes are protected and restricted to guide only
router.use(protect);
router.use(restrictTo('guide'));

// Dashboard statistics
router.get('/stats', getGuideDashboardStats);

// Tours management
router.get('/tours', getMyTours);

// Bookings management
router.get('/bookings', getMyBookings);
router.put('/bookings/:id/status', auditLogger('UPDATE_BOOKING_STATUS', 'BOOKING'), updateBookingStatus);

// Analytics
router.get('/analytics', getGuideAnalytics);

module.exports = router;
