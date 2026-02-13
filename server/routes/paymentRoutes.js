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

const router = express.Router();

// Protected routes (require authentication)
router.use(protect);

// Stripe routes
router.post('/stripe/create-session', createStripeCheckoutSession);
router.post('/stripe/verify', verifyStripePayment);

// PayPal routes
router.post('/paypal/create-order', createPayPalOrder);
router.post('/paypal/capture', capturePayPalPayment);

// Bank transfer routes
router.post('/bank-transfer', submitBankTransfer);

// Payment history
router.get('/my-payments', getMyPayments);
router.get('/:id', getPayment);

module.exports = router;
