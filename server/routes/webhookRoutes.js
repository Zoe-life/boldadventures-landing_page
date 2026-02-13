const express = require('express');
const {
  verifyStripeWebhook,
  verifyPayPalWebhook,
} = require('../middleware/paymentSecurity');
const {
  handleStripeWebhook,
  handlePayPalWebhook,
} = require('../controllers/webhookController');

const router = express.Router();

/**
 * Webhook routes for payment providers
 * These routes should NOT have CSRF protection as they are server-to-server
 * They should NOT have the JSON body parser - use raw body for signature verification
 */

// Stripe webhook
router.post('/stripe', express.raw({ type: 'application/json' }), verifyStripeWebhook, handleStripeWebhook);

// PayPal webhook
router.post('/paypal', verifyPayPalWebhook, handlePayPalWebhook);

module.exports = router;
