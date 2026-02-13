const crypto = require('crypto');

/**
 * Stripe Webhook Signature Verification
 * Verifies that webhooks are actually from Stripe
 */
const verifyStripeWebhook = (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).json({
      success: false,
      message: 'Webhook configuration error',
    });
  }

  // Only initialize Stripe when needed
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.warn('STRIPE_SECRET_KEY not configured');
    return res.status(500).json({
      success: false,
      message: 'Payment gateway not configured',
    });
  }

  try {
    const stripe = require('stripe')(stripeKey);
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
    req.stripeEvent = event;
    next();
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).json({
      success: false,
      message: 'Webhook signature verification failed',
    });
  }
};

/**
 * PayPal Webhook Signature Verification
 * Verifies that webhooks are actually from PayPal
 */
const verifyPayPalWebhook = async (req, res, next) => {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  
  if (!webhookId) {
    console.warn('PAYPAL_WEBHOOK_ID not configured');
    return res.status(500).json({
      success: false,
      message: 'Webhook configuration error',
    });
  }

  try {
    // PayPal webhook verification headers
    const transmissionId = req.headers['paypal-transmission-id'];
    const transmissionTime = req.headers['paypal-transmission-time'];
    const certUrl = req.headers['paypal-cert-url'];
    const authAlgo = req.headers['paypal-auth-algo'];
    const transmissionSig = req.headers['paypal-transmission-sig'];

    if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
      return res.status(400).json({
        success: false,
        message: 'Missing PayPal webhook headers',
      });
    }

    // Note: Full PayPal webhook verification requires PayPal SDK
    // This is a simplified version - in production, use PayPal SDK's webhook verification
    // For now, we'll verify the headers are present and log the event
    console.log('PayPal webhook received:', {
      transmissionId,
      transmissionTime,
      event: req.body?.event_type,
    });

    req.paypalEvent = req.body;
    next();
  } catch (err) {
    console.error('PayPal webhook verification failed:', err.message);
    return res.status(400).json({
      success: false,
      message: 'Webhook verification failed',
    });
  }
};

/**
 * Idempotency Key Validation
 * Prevents duplicate payment processing
 */
const validateIdempotencyKey = async (req, res, next) => {
  const idempotencyKey = req.headers['idempotency-key'];

  if (!idempotencyKey) {
    return res.status(400).json({
      success: false,
      message: 'Idempotency key is required for payment operations',
    });
  }

  // Validate format (should be a UUID or similar)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(idempotencyKey)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid idempotency key format',
    });
  }

  // Store the key in request for use in controller
  req.idempotencyKey = idempotencyKey;
  next();
};

/**
 * Payment Amount Validation
 * Ensures payment amounts are within reasonable bounds
 */
const validatePaymentAmount = (req, res, next) => {
  const { amount, currency } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment amount',
    });
  }

  // Maximum payment amount (adjust based on your business rules)
  const maxAmount = 1000000; // 1 million in the currency
  if (amount > maxAmount) {
    return res.status(400).json({
      success: false,
      message: `Payment amount exceeds maximum allowed (${maxAmount} ${currency})`,
    });
  }

  // Minimum payment amount
  const minAmount = 1;
  if (amount < minAmount) {
    return res.status(400).json({
      success: false,
      message: `Payment amount below minimum allowed (${minAmount} ${currency})`,
    });
  }

  next();
};

/**
 * Payment Double Submission Prevention
 * Checks if a payment is already in progress for a booking
 */
const preventDoublePayment = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required',
      });
    }

    const Payment = require('../models/Payment');
    const Booking = require('../models/Booking');

    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if booking is already paid
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been paid',
      });
    }

    // Check if there's a pending payment for this booking
    const pendingPayment = await Payment.findOne({
      booking: bookingId,
      status: { $in: ['pending', 'processing'] },
    });

    if (pendingPayment) {
      return res.status(400).json({
        success: false,
        message: 'A payment is already in progress for this booking',
        paymentId: pendingPayment._id,
      });
    }

    next();
  } catch (error) {
    console.error('Double payment check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Payment validation failed',
    });
  }
};

/**
 * Log payment transactions for audit trail
 */
const logPaymentTransaction = (req, res, next) => {
  const startTime = Date.now();

  // Log request details
  console.log('Payment transaction:', {
    method: req.method,
    path: req.path,
    userId: req.user?._id,
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log('Payment transaction completed:', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  });

  next();
};

/**
 * Sanitize payment data before processing
 * Remove any potentially harmful fields
 */
const sanitizePaymentData = (req, res, next) => {
  if (req.body) {
    // Remove any fields that shouldn't be set by client
    delete req.body.status;
    delete req.body.paymentDate;
    delete req.body.createdAt;
    delete req.body.updatedAt;
    delete req.body.__v;

    // Ensure amount is a number
    if (req.body.amount) {
      req.body.amount = parseFloat(req.body.amount);
      if (isNaN(req.body.amount)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid amount format',
        });
      }
    }
  }

  next();
};

module.exports = {
  verifyStripeWebhook,
  verifyPayPalWebhook,
  validateIdempotencyKey,
  validatePaymentAmount,
  preventDoublePayment,
  logPaymentTransaction,
  sanitizePaymentData,
};
