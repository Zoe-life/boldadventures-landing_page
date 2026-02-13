const express = require('express');
const { getCsrfToken } = require('../middleware/csrf');

const router = express.Router();

/**
 * @desc    Get CSRF token
 * @route   GET /api/csrf-token
 * @access  Public
 */
router.get('/csrf-token', getCsrfToken);

module.exports = router;
