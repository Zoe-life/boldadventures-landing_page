const express = require('express');
const {
  createStripeCheckoutSession,
  verifyStripePayment,
  createPayPalOrder,
  capturePayPalPayment,
  submitBankTransfer,
  getPayment,
  getMyPayments,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { paymentRateLimiter } = require('../middleware/security');
const { csrfProtection } = require('../middleware/csrf');
const {
  preventDoublePayment,
  logPaymentTransaction,
  sanitizePaymentData,
} = require('../middleware/paymentSecurity');

const router = express.Router();

// Protected routes (require authentication)
router.use(protect);

// Apply payment security middleware to all payment routes
router.use(paymentRateLimiter);
router.use(logPaymentTransaction);
router.use(sanitizePaymentData);

// Stripe routes
router.post('/stripe/create-session', csrfProtection, preventDoublePayment, createStripeCheckoutSession);
router.post('/stripe/verify', csrfProtection, verifyStripePayment);

// PayPal routes
router.post('/paypal/create-order', csrfProtection, preventDoublePayment, createPayPalOrder);
router.post('/paypal/capture', csrfProtection, capturePayPalPayment);

// Bank transfer routes
router.post('/bank-transfer', csrfProtection, preventDoublePayment, submitBankTransfer);

// Payment history
router.get('/my-payments', getMyPayments);
router.get('/:id', getPayment);

module.exports = router;
