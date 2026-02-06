const express = require('express');
const { body } = require('express-validator');
const {
  subscribe,
  unsubscribe,
  getSubscribers,
} = require('../controllers/newsletterController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation rules
const emailValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
];

// Public routes
router.post('/subscribe', emailValidation, validate, subscribe);
router.post('/unsubscribe', emailValidation, validate, unsubscribe);

// Protected routes (Admin only)
router.get('/subscribers', protect, restrictTo('admin'), getSubscribers);

module.exports = router;
