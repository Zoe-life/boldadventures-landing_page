const { doubleCsrf } = require('csrf-csrf');

/**
 * CSRF Protection Configuration
 * Uses double submit cookie pattern for CSRF protection
 */

const CSRF_SECRET = process.env.CSRF_SECRET || 'your-csrf-secret-change-in-production';

const {
  generateToken, // Use this to generate a token
  doubleCsrfProtection, // The middleware to validate the token
} = doubleCsrf({
  getSecret: () => CSRF_SECRET,
  cookieName: '__Host-psifi.x-csrf-token', // Prefix for enhanced security
  cookieOptions: {
    sameSite: 'strict',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  },
  size: 64, // Token size
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'], // Methods that don't need CSRF protection
  getTokenFromRequest: (req) => {
    // Check header first, then body
    return req.headers['x-csrf-token'] || req.body?._csrf;
  },
});

/**
 * CSRF Token Generation Endpoint Middleware
 * Generates and returns CSRF token to client
 */
const csrfTokenGenerator = (req, res, next) => {
  try {
    const csrfToken = generateToken(req, res);
    req.csrfToken = csrfToken;
    next();
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate CSRF token',
    });
  }
};

/**
 * CSRF Protection Middleware
 * Validates CSRF token for state-changing operations
 */
const csrfProtection = doubleCsrfProtection;

/**
 * Error handler for CSRF validation failures
 */
const csrfErrorHandler = (error, req, res, next) => {
  if (error.code === 'EBADCSRFTOKEN' || error.message?.includes('csrf')) {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token. Please refresh the page and try again.',
      error: 'CSRF_VALIDATION_FAILED',
    });
  }
  next(error);
};

/**
 * Route to get CSRF token
 * This should be called before making any state-changing requests
 */
const getCsrfToken = (req, res) => {
  const token = generateToken(req, res);
  res.json({
    success: true,
    csrfToken: token,
  });
};

module.exports = {
  csrfProtection,
  csrfTokenGenerator,
  csrfErrorHandler,
  getCsrfToken,
  generateToken,
};
