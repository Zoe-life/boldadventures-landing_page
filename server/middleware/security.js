const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const slowDown = require('express-slow-down');
const rateLimit = require('express-rate-limit');

/**
 * MongoDB NoSQL injection protection
 * Removes any keys that start with $ or contain .
 */
const sanitizeData = () => {
  return mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ key }) => {
      console.warn(`Sanitized key: ${key}`);
    },
  });
};

/**
 * HTTP Parameter Pollution protection
 * Prevents duplicate parameters in query strings
 */
const preventParameterPollution = () => {
  return hpp({
    whitelist: [
      'price',
      'difficulty',
      'duration',
      'category',
      'sort',
      'page',
      'limit',
    ],
  });
};

/**
 * Speed limiter for brute force protection
 * Slows down requests after a threshold
 */
const createSpeedLimiter = (options = {}) => {
  return slowDown({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    delayAfter: options.delayAfter || 50, // Allow 50 requests per windowMs
    delayMs: () => 500, // Fixed delay of 500ms per request after delayAfter
    maxDelayMs: options.maxDelayMs || 20000, // Maximum delay of 20 seconds
    skipFailedRequests: false,
    skipSuccessfulRequests: false,
  });
};

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks on login/register
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  skipSuccessfulRequests: true, // Don't count successful logins
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
    });
  },
});

/**
 * Strict rate limiter for payment endpoints
 * Prevents payment abuse
 */
const paymentRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 payment requests per windowMs
  skipSuccessfulRequests: false,
  message: {
    success: false,
    message: 'Too many payment requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many payment requests from this IP, please try again later.',
    });
  },
});

/**
 * Moderate rate limiter for general API endpoints
 */
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Validate request body size
 */
const validateRequestSize = (req, res, next) => {
  const contentLength = req.headers['content-length'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength && parseInt(contentLength) > maxSize) {
    return res.status(413).json({
      success: false,
      message: 'Request entity too large',
    });
  }

  next();
};

/**
 * Add security headers to response
 */
const securityHeaders = (req, res, next) => {
  // Remove powered-by header
  res.removeHeader('X-Powered-By');
  
  // Add custom security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

/**
 * Validate origin for payment webhooks
 */
const validateWebhookOrigin = (allowedOrigins = []) => {
  return (req, res, next) => {
    const origin = req.headers.origin || req.headers.referer;
    
    if (!origin) {
      // For server-to-server webhooks, origin may not be present
      return next();
    }

    try {
      const url = new URL(origin);
      const isAllowed = allowedOrigins.some(allowed => {
        if (allowed === '*') return true;
        return url.hostname === allowed || url.hostname.endsWith(`.${allowed}`);
      });

      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden origin',
        });
      }

      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid origin',
      });
    }
  };
};

module.exports = {
  sanitizeData,
  preventParameterPollution,
  createSpeedLimiter,
  authRateLimiter,
  paymentRateLimiter,
  apiRateLimiter,
  validateRequestSize,
  securityHeaders,
  validateWebhookOrigin,
};
