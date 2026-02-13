const User = require('../models/User');
const Tour = require('../models/Tour');
const fs = require('fs');
const path = require('path');
const { isCloudinaryConfigured, uploadToCloudinary } = require('../config/cloudinary');

/**
 * Helper function to upload file to Cloudinary and delete local file
 * @param {object} file - Multer file object
 * @param {string} folder - Cloudinary folder path
 */
const uploadFileToCloudinary = async (file, folder) => {
  if (!isCloudinaryConfigured()) {
    // Return local URL if Cloudinary not configured
    return `/images/uploads/${file.filename}`;
  }

  try {
    // Upload to Cloudinary
    const result = await uploadToCloudinary(file.path, { folder });
    
    // Delete local file after successful upload
    try {
      fs.unlinkSync(file.path);
    } catch (err) {
      console.error('Error deleting local file:', err);
    }
    
    return result.url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    // If Cloudinary fails, fall back to local storage
    return `/images/uploads/${file.filename}`;
  }
};

/**
 * Helper function to delete local file if needed
 * @param {object} file - Multer file object
 */
const deleteLocalFile = (file) => {
  if (file && file.path) {
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

    // Upload to Cloudinary or use local URL
    const imageUrl = await uploadFileToCloudinary(req.file, 'boldadventures/profiles');

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
    // Delete uploaded file if database update fails
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
      updateData.coverImage = await uploadFileToCloudinary(
        req.files.coverImage[0],
        'boldadventures/tours/covers'
      );
    }

    // Handle additional images
    if (req.files && req.files.images) {
      const uploadPromises = req.files.images.map(file =>
        uploadFileToCloudinary(file, 'boldadventures/tours/gallery')
      );
      const imageUrls = await Promise.all(uploadPromises);
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
    // Delete uploaded files on error
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

    // Upload to Cloudinary or use local URL
    const imageUrl = await uploadFileToCloudinary(req.file, 'boldadventures');

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
    // Delete uploaded file on error
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
