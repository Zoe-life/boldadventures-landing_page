const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'A booking must have a tour'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A booking must have a user'],
    },
    startDate: {
      type: Date,
      required: [true, 'A booking must have a start date'],
    },
    numberOfPeople: {
      type: Number,
      required: [true, 'Please specify number of people'],
      min: [1, 'Number of people must be at least 1'],
    },
    totalPrice: {
      type: Number,
      required: [true, 'A booking must have a price'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
    },
    cancelledAt: Date,
    cancellationReason: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
bookingSchema.index({ tour: 1, user: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ status: 1 });

// Pre-find middleware to populate tour and user
bookingSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'tour',
    select: 'title duration difficulty category coverImage price',
  }).populate({
    path: 'user',
    select: 'name email',
  });
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
