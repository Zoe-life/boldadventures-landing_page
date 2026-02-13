const express = require('express');
const passport = require('passport');
const { body } = require('express-validator');
const {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  updateProfile,
  changePassword,
  googleCallback,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authRateLimiter } = require('../middleware/security');
const { csrfProtection } = require('../middleware/csrf');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const updateProfileValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters'),
];

const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
];

const resetPasswordValidation = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
];

// Routes
router.post('/register', authRateLimiter, csrfProtection, registerValidation, validate, register);
router.post('/login', authRateLimiter, csrfProtection, loginValidation, validate, login);
router.post('/logout', protect, csrfProtection, logout);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);
router.put('/me', protect, csrfProtection, updateProfileValidation, validate, updateProfile);
router.put('/change-password', protect, csrfProtection, changePasswordValidation, validate, changePassword);

// Password reset routes
router.post('/forgot-password', authRateLimiter, csrfProtection, forgotPasswordValidation, validate, forgotPassword);
router.post('/reset-password/:token', authRateLimiter, csrfProtection, resetPasswordValidation, validate, resetPassword);

// Email verification routes
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', protect, csrfProtection, resendVerification);

// Google OAuth Routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/login.html?oauth=error',
    session: false,
  }),
  googleCallback
);

module.exports = router;
