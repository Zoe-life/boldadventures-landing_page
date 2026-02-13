const { stripe, stripeConfig, paypalConfig } = require('../config/payment');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { convertCurrency } = require('../utils/currencyConverter');

/**
 * @desc    Create Stripe checkout session for booking payment
 * @route   POST /api/payments/stripe/create-session
 * @access  Private
 */
const createStripeCheckoutSession = async (req, res) => {
  try {
    const { bookingId } = req.body;

    // Get booking details
    const booking = await Booking.findById(bookingId).populate('user');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if user owns the booking
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this booking',
      });
    }

    // Check if already paid
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Booking has already been paid',
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: stripeConfig.currency,
            product_data: {
              name: `${booking.tour.title} - Tour Booking`,
              description: `Booking for ${booking.numberOfPeople} people`,
            },
            unit_amount: Math.round(booking.totalPrice * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${stripeConfig.successUrl}?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
      cancel_url: `${stripeConfig.cancelUrl}?booking_id=${bookingId}`,
      metadata: {
        bookingId: bookingId.toString(),
        userId: req.user._id.toString(),
      },
    });

    // Create payment record
    const payment = await Payment.create({
      booking: bookingId,
      user: req.user._id,
      amount: booking.totalPrice,
      currency: stripeConfig.currency.toUpperCase(),
      paymentMethod: 'stripe',
      status: 'pending',
      stripeSessionId: session.id,
      metadata: {
        sessionUrl: session.url,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        sessionUrl: session.url,
        payment,
      },
    });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment session',
      error: error.message,
    });
  }
};

/**
 * @desc    Verify Stripe payment
 * @route   POST /api/payments/stripe/verify
 * @access  Private
 */
const verifyStripePayment = async (req, res) => {
  try {
    const { sessionId, bookingId } = req.body;

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      // Update payment record
      const payment = await Payment.findOneAndUpdate(
        { stripeSessionId: sessionId },
        {
          status: 'completed',
          paymentDate: new Date(),
          stripePaymentIntentId: session.payment_intent,
        },
        { new: true }
      );

      // Update booking
      await Booking.findByIdAndUpdate(bookingId, {
        paymentStatus: 'paid',
        status: 'confirmed',
      });

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: { payment },
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment not completed',
      });
    }
  } catch (error) {
    console.error('Stripe verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message,
    });
  }
};

/**
 * @desc    Create PayPal order for booking payment
 * @route   POST /api/payments/paypal/create-order
 * @access  Private
 */
const createPayPalOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    // Get booking details
    const booking = await Booking.findById(bookingId).populate('user');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if user owns the booking
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this booking',
      });
    }

    // Check if already paid
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Booking has already been paid',
      });
    }

    // Convert KES to USD for PayPal using real-time exchange rates
    const amountInUSD = await convertCurrency(booking.totalPrice, 'KES', 'USD');
    const amountInUSDFormatted = amountInUSD.toFixed(2);

    // PayPal order creation payload
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: amountInUSDFormatted,
          },
          description: `${booking.tour.title} - Tour Booking for ${booking.numberOfPeople} people`,
          reference_id: bookingId.toString(),
        },
      ],
      application_context: {
        brand_name: 'BoldAdventures',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${process.env.CLIENT_URL || 'http://localhost:5000'}/payment-success.html?booking_id=${bookingId}`,
        cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5000'}/payment-cancel.html?booking_id=${bookingId}`,
      },
    };

    // Note: PayPal order creation requires the PayPal SDK on the client side
    // This endpoint returns order data for client-side PayPal button integration
    
    // Create payment record
    const payment = await Payment.create({
      booking: bookingId,
      user: req.user._id,
      amount: booking.totalPrice,
      currency: 'USD',
      paymentMethod: 'paypal',
      status: 'pending',
      metadata: {
        orderData,
        originalAmount: booking.totalPrice,
        originalCurrency: 'KES',
      },
    });

    res.status(200).json({
      success: true,
      message: 'PayPal order data prepared',
      data: {
        orderData,
        payment,
        clientId: paypalConfig.clientId,
      },
    });
  } catch (error) {
    console.error('PayPal order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create PayPal order',
      error: error.message,
    });
  }
};

/**
 * @desc    Capture PayPal payment
 * @route   POST /api/payments/paypal/capture
 * @access  Private
 */
const capturePayPalPayment = async (req, res) => {
  try {
    const { orderId, bookingId } = req.body;

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { booking: bookingId, paymentMethod: 'paypal', status: 'pending' },
      {
        status: 'completed',
        paymentDate: new Date(),
        paypalOrderId: orderId,
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    // Update booking
    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: 'paid',
      status: 'confirmed',
    });

    res.status(200).json({
      success: true,
      message: 'PayPal payment captured successfully',
      data: { payment },
    });
  } catch (error) {
    console.error('PayPal capture error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to capture PayPal payment',
      error: error.message,
    });
  }
};

/**
 * @desc    Submit bank transfer payment
 * @route   POST /api/payments/bank-transfer
 * @access  Private
 */
const submitBankTransfer = async (req, res) => {
  try {
    const { bookingId, bankTransferReference, bankTransferProof } = req.body;

    // Get booking details
    const booking = await Booking.findById(bookingId).populate('user');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if user owns the booking
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this booking',
      });
    }

    // Create payment record
    const payment = await Payment.create({
      booking: bookingId,
      user: req.user._id,
      amount: booking.totalPrice,
      currency: 'KES',
      paymentMethod: 'bank_transfer',
      status: 'pending', // Requires admin verification
      bankTransferReference,
      bankTransferProof,
      notes: 'Awaiting admin verification',
    });

    res.status(200).json({
      success: true,
      message: 'Bank transfer details submitted. Awaiting verification.',
      data: { payment },
    });
  } catch (error) {
    console.error('Bank transfer submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit bank transfer details',
      error: error.message,
    });
  }
};

/**
 * @desc    Get payment details
 * @route   GET /api/payments/:id
 * @access  Private
 */
const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('booking')
      .populate('user', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // Check authorization
    if (
      payment.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this payment',
      });
    }

    res.status(200).json({
      success: true,
      data: { payment },
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment',
      error: error.message,
    });
  }
};

/**
 * @desc    Get user's payment history
 * @route   GET /api/payments/my-payments
 * @access  Private
 */
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('booking')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: payments.length,
      data: { payments },
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payments',
      error: error.message,
    });
  }
};

module.exports = {
  createStripeCheckoutSession,
  verifyStripePayment,
  createPayPalOrder,
  capturePayPalPayment,
  submitBankTransfer,
  getPayment,
  getMyPayments,
};
