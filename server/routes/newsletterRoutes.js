const express = require('express');
const { body } = require('express-validator');
const {
  subscribe,
  unsubscribe,
  getSubscribers,
  sendNewsletter,
} = require('../controllers/newsletterController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { csrfProtection } = require('../middleware/csrf');

const router = express.Router();

// Validation rules
const emailValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
];

const newsletterValidation = [
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
];

// Public routes
router.post('/subscribe', emailValidation, validate, subscribe);
router.post('/unsubscribe', emailValidation, validate, unsubscribe);

// Protected routes (Admin only)
router.get('/subscribers', protect, restrictTo('admin'), getSubscribers);
router.post('/send', protect, restrictTo('admin'), csrfProtection, newsletterValidation, validate, sendNewsletter);

module.exports = router;
