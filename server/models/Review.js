const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    rating: {
      type: Number,
      required: [true, 'Review must have a rating'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must not be more than 5'],
    },
    comment: {
      type: String,
      required: [true, 'Review must have a comment'],
      trim: true,
      maxlength: [1000, 'Comment cannot be more than 1000 characters'],
    },
    isApproved: {
      type: Boolean,
      default: true, // Auto-approve by default, can be changed to false for moderation
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews (one review per user per tour)
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// Populate user info when querying reviews
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name avatar',
  });
  next();
});

// Static method to calculate average rating for a tour
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId, isApproved: true },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model('Tour').findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      rating: Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal
    });
  } else {
    // Reset to defaults if no reviews
    await mongoose.model('Tour').findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      rating: 4.5,
    });
  }
};

// Update tour rating after saving a review
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.tour);
});

// Update tour rating after removing a review
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRatings(doc.tour);
  }
});

// Update tour rating after updating a review
reviewSchema.post('findOneAndUpdate', async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRatings(doc.tour);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
