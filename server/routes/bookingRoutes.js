const express = require('express');
const { body } = require('express-validator');
const {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  getAllBookings,
} = require('../controllers/bookingController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation rules
const bookingValidation = [
  body('tourId').notEmpty().withMessage('Tour ID is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('numberOfPeople')
    .isInt({ min: 1 })
    .withMessage('Number of people must be at least 1'),
];

// Admin routes (must be before protect middleware)
router.get('/all', protect, restrictTo('admin'), getAllBookings);

// Protected routes (require authentication)
router.use(protect);

// User routes
router.post('/', bookingValidation, validate, createBooking);
router.get('/my-bookings', getMyBookings);
router.get('/:id', getBooking);
router.put('/:id/cancel', cancelBooking);

module.exports = router;
