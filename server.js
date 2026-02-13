require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const passport = require('passport');

const connectDB = require('./server/config/database');
const { errorHandler, notFound } = require('./server/middleware/errorHandler');
const {
  sanitizeData,
  preventParameterPollution,
  createSpeedLimiter,
  apiRateLimiter,
  validateRequestSize,
  securityHeaders,
} = require('./server/middleware/security');
const { csrfErrorHandler } = require('./server/middleware/csrf');

// Import routes
const authRoutes = require('./server/routes/authRoutes');
const tourRoutes = require('./server/routes/tourRoutes');
const newsletterRoutes = require('./server/routes/newsletterRoutes');
const bookingRoutes = require('./server/routes/bookingRoutes');
const paymentRoutes = require('./server/routes/paymentRoutes');
const currencyRoutes = require('./server/routes/currencyRoutes');
const csrfRoutes = require('./server/routes/csrfRoutes');
const webhookRoutes = require('./server/routes/webhookRoutes');

// Initialize express
const app = express();

// Connect to database
connectDB();

// Passport configuration
require('./server/config/passport')(passport);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com", "https://www.paypal.com"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://api.stripe.com", "https://www.paypal.com"],
      frameSrc: ["'self'", "https://js.stripe.com", "https://www.paypal.com"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// Additional security headers
app.use(securityHeaders);

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Speed limiter to slow down brute force attacks
app.use('/api/', createSpeedLimiter());

// Cookie parser (before webhooks as webhooks may need to be excluded)
app.use(cookieParser());

// Webhook routes (MUST be before body parser to get raw body for signature verification)
app.use('/api/webhooks', webhookRoutes);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request size validation
app.use(validateRequestSize);

// Data sanitization against NoSQL injection
app.use(sanitizeData());

// Prevent HTTP Parameter Pollution
app.use(preventParameterPollution());

// Cookie parser - moved earlier before webhook routes
// app.use(cookieParser()); - Already added before webhooks

// Initialize Passport
app.use(passport.initialize());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve static files
app.use(express.static(path.join(__dirname, '/')));

// API routes
app.use('/api', csrfRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/currency', currencyRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend for all other routes (SPA support)
app.use((req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling
app.use(notFound);
app.use(csrfErrorHandler);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;
