const express = require('express');
const {
  uploadProfilePicture,
  uploadTourImages,
  uploadImage,
  deleteImage,
} = require('../controllers/uploadController');
const { protect, restrictTo } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');
const {
  uploadSingleImage,
  uploadTourImages: uploadTourImagesMiddleware,
  handleUploadError,
} = require('../utils/upload');

const router = express.Router();

// Routes
router.post(
  '/profile',
  protect,
  csrfProtection,
  uploadSingleImage,
  handleUploadError,
  uploadProfilePicture
);

router.post(
  '/tour/:tourId',
  protect,
  restrictTo('admin', 'guide'),
  csrfProtection,
  uploadTourImagesMiddleware,
  handleUploadError,
  uploadTourImages
);

router.post(
  '/image',
  protect,
  csrfProtection,
  uploadSingleImage,
  handleUploadError,
  uploadImage
);

router.delete(
  '/image/:filename',
  protect,
  restrictTo('admin'),
  csrfProtection,
  deleteImage
);

module.exports = router;
