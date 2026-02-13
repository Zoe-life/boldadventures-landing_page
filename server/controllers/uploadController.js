const User = require('../models/User');
const Tour = require('../models/Tour');
const fs = require('fs');
const path = require('path');

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
    const imageUrl = `/images/uploads/${req.file.filename}`;

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
      },
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    // Delete uploaded file if database update fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
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
          fs.unlinkSync(file.path);
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
          fs.unlinkSync(file.path);
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
      updateData.coverImage = `/images/uploads/${req.files.coverImage[0].filename}`;
    }

    // Handle additional images
    if (req.files && req.files.images) {
      const imageUrls = req.files.images.map(
        file => `/images/uploads/${file.filename}`
      );
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
      },
    });
  } catch (error) {
    console.error('Upload tour images error:', error);
    // Delete uploaded files on error
    if (req.files) {
      Object.values(req.files).flat().forEach(file => {
        fs.unlinkSync(file.path);
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
    const imageUrl = `/images/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    console.error('Upload image error:', error);
    // Delete uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
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
