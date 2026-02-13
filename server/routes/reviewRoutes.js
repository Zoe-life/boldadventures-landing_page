const express = require('express');
const { body } = require('express-validator');
const {
  createReview,
  getTourReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  getAllReviews,
} = require('../controllers/reviewController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { csrfProtection } = require('../middleware/csrf');

const router = express.Router();

// Validation rules
const createReviewValidation = [
  body('tour').notEmpty().withMessage('Tour ID is required').isMongoId().withMessage('Invalid tour ID'),
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .notEmpty()
    .withMessage('Comment is required')
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters'),
];

const updateReviewValidation = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters'),
];

// Routes
router.post('/', protect, csrfProtection, createReviewValidation, validate, createReview);
router.get('/tour/:tourId', getTourReviews);
router.get('/my-reviews', protect, getUserReviews);
router.put('/:id', protect, csrfProtection, updateReviewValidation, validate, updateReview);
router.delete('/:id', protect, csrfProtection, deleteReview);
router.get('/', protect, restrictTo('admin'), getAllReviews);

module.exports = router;
