const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Payment configuration for Stripe and PayPal
 */
module.exports = {
  stripe,
  
  // Stripe configuration
  stripeConfig: {
    currency: 'kes', // Kenyan Shillings
    successUrl: `${process.env.CLIENT_URL || 'http://localhost:5000'}/payment-success.html`,
    cancelUrl: `${process.env.CLIENT_URL || 'http://localhost:5000'}/payment-cancel.html`,
  },

  // PayPal configuration
  paypalConfig: {
    mode: process.env.PAYPAL_MODE || 'sandbox', // 'sandbox' or 'live'
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
  },
};
