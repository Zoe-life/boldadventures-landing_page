const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Payment must be associated with a booking'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Payment must be associated with a user'],
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Payment amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'KES',
      enum: ['KES', 'USD', 'EUR', 'GBP'],
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: ['stripe', 'paypal', 'bank_transfer'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
      default: 'pending',
    },
    // Stripe-specific fields
    stripePaymentIntentId: {
      type: String,
      sparse: true,
    },
    stripeSessionId: {
      type: String,
      sparse: true,
    },
    // PayPal-specific fields
    paypalOrderId: {
      type: String,
      sparse: true,
    },
    paypalCaptureId: {
      type: String,
      sparse: true,
    },
    // Bank transfer-specific fields
    bankTransferReference: {
      type: String,
      sparse: true,
    },
    bankTransferProof: {
      type: String, // URL to uploaded proof of payment
      sparse: true,
    },
    // Additional payment details
    paymentDate: {
      type: Date,
    },
    refundDate: {
      type: Date,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundReason: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
paymentSchema.index({ booking: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentMethod: 1 });

// Update booking payment status when payment is completed
paymentSchema.post('save', async function (doc) {
  if (doc.status === 'completed') {
    const Booking = mongoose.model('Booking');
    await Booking.findByIdAndUpdate(doc.booking, {
      paymentStatus: 'paid',
    });
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
