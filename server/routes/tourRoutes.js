const express = require('express');
const { body } = require('express-validator');
const {
  getTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  getFeaturedTours,
} = require('../controllers/tourController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { auditLogger } = require('../middleware/auditLog');

const router = express.Router();

// Validation rules
const tourValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('location.country').notEmpty().withMessage('Country is required'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 day'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('maxGroupSize').isInt({ min: 1 }).withMessage('Max group size must be at least 1'),
  body('category')
    .isIn(['hiking', 'biking', 'adventure-package'])
    .withMessage('Invalid category'),
  body('coverImage').notEmpty().withMessage('Cover image is required'),
];

// Public routes
router.get('/', getTours);
router.get('/featured', getFeaturedTours);
router.get('/:id', getTour);

// Protected routes (Admin/Guide only) with audit logging
router.post('/', protect, restrictTo('admin', 'guide'), tourValidation, validate, auditLogger('CREATE_TOUR', 'TOUR'), createTour);
router.put('/:id', protect, restrictTo('admin', 'guide'), auditLogger('UPDATE_TOUR', 'TOUR'), updateTour);
router.delete('/:id', protect, restrictTo('admin'), auditLogger('DELETE_TOUR', 'TOUR'), deleteTour);

module.exports = router;
