const User = require('../models/User');
const Tour = require('../models/Tour');
const fs = require('fs');
const path = require('path');
const { isCloudinaryConfigured } = require('../config/cloudinary');

/**
 * Helper function to get image URL based on storage type
 * @param {object} file - Multer file object
 */
const getImageUrl = (file) => {
  if (isCloudinaryConfigured()) {
    // Cloudinary URL is already in file.path
    return file.path;
  } else {
    // Local file URL
    return `/images/uploads/${file.filename}`;
  }
};

/**
 * Helper function to delete local file if needed
 * @param {object} file - Multer file object
 */
const deleteLocalFile = (file) => {
  if (!isCloudinaryConfigured() && file && file.path) {
    try {
      fs.unlinkSync(file.path);
    } catch (error) {
      console.error('Error deleting local file:', error);
    }
  }
};

/**
 * @desc    Upload user profile picture
 * @route   POST /api/upload/profile
 * @access  Private
 */
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Generate URL for the uploaded file
    const imageUrl = getImageUrl(req.file);

    // Update user avatar
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: imageUrl },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        imageUrl,
        user,
        storageType: isCloudinaryConfigured() ? 'cloudinary' : 'local',
      },
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    // Delete uploaded file if database update fails (only for local storage)
    deleteLocalFile(req.file);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture',
      error: error.message,
    });
  }
};

/**
 * @desc    Upload tour images
 * @route   POST /api/upload/tour/:tourId
 * @access  Private (Guide/Admin only)
 */
const uploadTourImages = async (req, res) => {
  try {
    const { tourId } = req.params;

    // Check if tour exists
    const tour = await Tour.findById(tourId);
    if (!tour) {
      // Delete uploaded files if tour not found
      if (req.files) {
        Object.values(req.files).flat().forEach(file => {
          deleteLocalFile(file);
        });
      }
      return res.status(404).json({
        success: false,
        message: 'Tour not found',
      });
    }

    // Check if user is authorized (admin or tour creator)
    if (
      req.user.role !== 'admin' &&
      tour.createdBy.toString() !== req.user._id.toString()
    ) {
      // Delete uploaded files if unauthorized
      if (req.files) {
        Object.values(req.files).flat().forEach(file => {
          deleteLocalFile(file);
        });
      }
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to upload images for this tour',
      });
    }

    const updateData = {};

    // Handle cover image
    if (req.files && req.files.coverImage && req.files.coverImage[0]) {
      updateData.coverImage = getImageUrl(req.files.coverImage[0]);
    }

    // Handle additional images
    if (req.files && req.files.images) {
      const imageUrls = req.files.images.map(file => getImageUrl(file));
      updateData.images = [...(tour.images || []), ...imageUrls];
    }

    // Update tour
    const updatedTour = await Tour.findByIdAndUpdate(
      tourId,
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Tour images uploaded successfully',
      data: {
        tour: updatedTour,
        storageType: isCloudinaryConfigured() ? 'cloudinary' : 'local',
      },
    });
  } catch (error) {
    console.error('Upload tour images error:', error);
    // Delete uploaded files on error (only for local storage)
    if (req.files) {
      Object.values(req.files).flat().forEach(file => {
        deleteLocalFile(file);
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to upload tour images',
      error: error.message,
    });
  }
};

/**
 * @desc    Upload single image
 * @route   POST /api/upload/image
 * @access  Private
 */
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Generate URL for the uploaded file
    const imageUrl = getImageUrl(req.file);

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageUrl,
        filename: req.file.filename || req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        storageType: isCloudinaryConfigured() ? 'cloudinary' : 'local',
      },
    });
  } catch (error) {
    console.error('Upload image error:', error);
    // Delete uploaded file on error (only for local storage)
    deleteLocalFile(req.file);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete uploaded image
 * @route   DELETE /api/upload/image/:filename
 * @access  Private (Admin only)
 */
const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (isCloudinaryConfigured()) {
      // For Cloudinary, we would need the public_id to delete
      // This is a simplified implementation
      return res.status(200).json({
        success: true,
        message: 'Image deletion from Cloudinary requires public_id. Please use the deleteFromCloudinary utility directly.',
      });
    }

    const filePath = path.join(__dirname, '../../images/uploads', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Image not found',
      });
    }

    // Delete file
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message,
    });
  }
};

module.exports = {
  uploadProfilePicture,
  uploadTourImages,
  uploadImage,
  deleteImage,
};
