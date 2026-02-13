const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A tour must have a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'A tour must have a description'],
      trim: true,
    },
    location: {
      country: {
        type: String,
        required: [true, 'A tour must have a country'],
      },
      city: String,
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: [Number], // [longitude, latitude]
      },
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
      min: [1, 'Duration must be at least 1 day'],
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
      min: [0, 'Price cannot be negative'],
    },
    currency: {
      type: String,
      default: 'KSH',
      enum: ['KSH', 'USD', 'EUR', 'GBP'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
      min: [1, 'Group size must be at least 1'],
    },
    difficulty: {
      type: String,
      enum: ['easy', 'moderate', 'difficult'],
      default: 'moderate',
    },
    category: {
      type: String,
      enum: ['hiking', 'biking', 'adventure-package'],
      required: [true, 'A tour must have a category'],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be at least 1.0'],
      max: [5, 'Rating must not be more than 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    images: [
      {
        type: String,
      },
    ],
    coverImage: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    startDates: [Date],
    isActive: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
tourSchema.index({ slug: 1 });
tourSchema.index({ price: 1, rating: -1 });
tourSchema.index({ 'location.coordinates': '2dsphere' });

// Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// Pre-save middleware to create slug
tourSchema.pre('save', function (next) {
  if (!this.isModified('title')) return next();
  this.slug = this.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
  next();
});

module.exports = mongoose.model('Tour', tourSchema);
