const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { sendPaymentReceipt, sendBookingConfirmation } = require('../utils/emailService');

/**
 * @desc    Handle Stripe webhook events
 * @route   POST /api/webhooks/stripe
 * @access  Public (verified by webhook signature)
 */
const handleStripeWebhook = async (req, res) => {
  try {
    const event = req.stripeEvent;

    console.log('Stripe webhook event received:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleStripeCheckoutCompleted(event.data.object);
        break;

      case 'payment_intent.succeeded':
        await handleStripePaymentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handleStripePaymentFailed(event.data.object);
        break;

      case 'charge.refunded':
        await handleStripeRefund(event.data.object);
        break;

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook handler failed',
    });
  }
};

/**
 * Handle Stripe checkout session completed
 */
const handleStripeCheckoutCompleted = async (session) => {
  try {
    const bookingId = session.metadata?.bookingId;

    if (!bookingId) {
      console.error('No booking ID in session metadata');
      return;
    }

    // Check if payment already processed (idempotency)
    const existingPayment = await Payment.findOne({ 
      stripeSessionId: session.id,
      status: 'completed'
    });

    if (existingPayment) {
      console.log(`Payment already processed for session: ${session.id}`);
      return;
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { stripeSessionId: session.id },
      {
        status: 'completed',
        paymentDate: new Date(),
        stripePaymentIntentId: session.payment_intent,
      },
      { new: true }
    ).populate('user').populate('booking');

    // Update booking
    const booking = await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: 'paid',
      status: 'confirmed',
    }, { new: true }).populate('tour');

    // Send confirmation emails
    if (payment && booking && payment.user && booking.tour) {
      try {
        await sendPaymentReceipt(payment, payment.user, booking, booking.tour);
        await sendBookingConfirmation(booking, payment.user, booking.tour);
      } catch (emailError) {
        console.error('Failed to send confirmation emails:', emailError);
        // Don't fail webhook processing if emails fail
      }
    }

    console.log(`✅ Payment verified and completed for booking: ${bookingId}`);
  } catch (error) {
    console.error('Error handling checkout completed:', error);
    throw error; // Re-throw to mark webhook as failed
  }
};

/**
 * Handle Stripe payment succeeded
 */
const handleStripePaymentSucceeded = async (paymentIntent) => {
  try {
    console.log(`Payment succeeded: ${paymentIntent.id}`);
    // Additional logic if needed
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
};

/**
 * Handle Stripe payment failed
 */
const handleStripePaymentFailed = async (paymentIntent) => {
  try {
    // Update payment record to failed
    await Payment.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      {
        status: 'failed',
        notes: `Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`,
      }
    );

    console.log(`Payment failed: ${paymentIntent.id}`);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
};

/**
 * Handle Stripe refund
 */
const handleStripeRefund = async (charge) => {
  try {
    // Update payment record to refunded
    await Payment.findOneAndUpdate(
      { stripePaymentIntentId: charge.payment_intent },
      {
        status: 'refunded',
        notes: 'Payment refunded',
      }
    );

    console.log(`Payment refunded: ${charge.id}`);
  } catch (error) {
    console.error('Error handling refund:', error);
  }
};

/**
 * @desc    Handle PayPal webhook events
 * @route   POST /api/webhooks/paypal
 * @access  Public (verified by webhook signature)
 */
const handlePayPalWebhook = async (req, res) => {
  try {
    const event = req.paypalEvent;

    console.log('PayPal webhook event received:', event.event_type);

    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePayPalCaptureCompleted(event.resource);
        break;

      case 'PAYMENT.CAPTURE.DENIED':
        await handlePayPalCaptureDenied(event.resource);
        break;

      case 'PAYMENT.CAPTURE.REFUNDED':
        await handlePayPalRefund(event.resource);
        break;

      default:
        console.log(`Unhandled PayPal event type: ${event.event_type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook handler failed',
    });
  }
};

/**
 * Handle PayPal capture completed
 */
const handlePayPalCaptureCompleted = async (resource) => {
  try {
    const orderId = resource.supplementary_data?.related_ids?.order_id;

    if (!orderId) {
      console.error('No order ID in PayPal resource');
      return;
    }

    // Check if payment already processed (idempotency)
    const existingPayment = await Payment.findOne({ 
      paypalOrderId: orderId,
      status: 'completed'
    });

    if (existingPayment) {
      console.log(`Payment already processed for PayPal order: ${orderId}`);
      return;
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { paypalOrderId: orderId },
      {
        status: 'completed',
        paymentDate: new Date(),
      },
      { new: true }
    ).populate('user').populate('booking');

    if (payment && payment.booking) {
      // Update booking
      const booking = await Booking.findByIdAndUpdate(
        payment.booking._id,
        {
          paymentStatus: 'paid',
          status: 'confirmed',
        },
        { new: true }
      ).populate('tour');

      // Send confirmation emails
      if (booking && payment.user && booking.tour) {
        try {
          await sendPaymentReceipt(payment, payment.user, booking, booking.tour);
          await sendBookingConfirmation(booking, payment.user, booking.tour);
        } catch (emailError) {
          console.error('Failed to send confirmation emails:', emailError);
          // Don't fail webhook processing if emails fail
        }
      }
    }

    console.log(`✅ PayPal payment verified and completed for order: ${orderId}`);
  } catch (error) {
    console.error('Error handling PayPal capture completed:', error);
    throw error; // Re-throw to mark webhook as failed
  }
};

/**
 * Handle PayPal capture denied
 */
const handlePayPalCaptureDenied = async (resource) => {
  try {
    const orderId = resource.supplementary_data?.related_ids?.order_id;

    if (orderId) {
      await Payment.findOneAndUpdate(
        { paypalOrderId: orderId },
        {
          status: 'failed',
          notes: 'Payment denied by PayPal',
        }
      );
    }

    console.log(`PayPal payment denied for order: ${orderId}`);
  } catch (error) {
    console.error('Error handling PayPal capture denied:', error);
  }
};

/**
 * Handle PayPal refund
 */
const handlePayPalRefund = async (resource) => {
  try {
    const orderId = resource.supplementary_data?.related_ids?.order_id;

    if (orderId) {
      await Payment.findOneAndUpdate(
        { paypalOrderId: orderId },
        {
          status: 'refunded',
          notes: 'Payment refunded',
        }
      );
    }

    console.log(`PayPal payment refunded for order: ${orderId}`);
  } catch (error) {
    console.error('Error handling PayPal refund:', error);
  }
};

module.exports = {
  handleStripeWebhook,
  handlePayPalWebhook,
};
