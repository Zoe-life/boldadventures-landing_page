const Notification = require('../models/Notification');

let io;

/**
 * Initialize socket.io
 * @param {object} socketIO - Socket.io instance
 */
const initializeSocket = (socketIO) => {
  io = socketIO;

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join user's personal room
    socket.on('join', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined their notification room`);
    });

    // Leave room
    socket.on('leave', (userId) => {
      socket.leave(`user_${userId}`);
      console.log(`User ${userId} left their notification room`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

/**
 * Create and send notification
 * @param {string} userId - User ID to send notification to
 * @param {object} notificationData - Notification data
 */
const createNotification = async (userId, notificationData) => {
  try {
    // Create notification in database
    const notification = await Notification.create({
      user: userId,
      ...notificationData,
    });

    // Populate user data
    await notification.populate('user', 'name email');

    // Send real-time notification via socket.io if initialized
    if (io) {
      io.to(`user_${userId}`).emit('notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Send booking notification
 * @param {string} userId - User ID
 * @param {object} bookingData - Booking details
 */
const sendBookingNotification = async (userId, bookingData) => {
  return await createNotification(userId, {
    type: 'booking',
    title: 'Booking Confirmed',
    message: `Your booking for "${bookingData.tourName}" has been confirmed`,
    data: { bookingId: bookingData.bookingId },
    link: `/booking/${bookingData.bookingId}`,
  });
};

/**
 * Send payment notification
 * @param {string} userId - User ID
 * @param {object} paymentData - Payment details
 */
const sendPaymentNotification = async (userId, paymentData) => {
  return await createNotification(userId, {
    type: 'payment',
    title: 'Payment Successful',
    message: `Your payment of ${paymentData.currency} ${paymentData.amount} has been processed`,
    data: { paymentId: paymentData.paymentId },
    link: `/payment/${paymentData.paymentId}`,
  });
};

/**
 * Send review notification
 * @param {string} userId - User ID
 * @param {object} reviewData - Review details
 */
const sendReviewNotification = async (userId, reviewData) => {
  return await createNotification(userId, {
    type: 'review',
    title: 'New Review',
    message: reviewData.message,
    data: { reviewId: reviewData.reviewId },
    link: `/tour/${reviewData.tourId}`,
  });
};

/**
 * Get user notifications
 * @param {string} userId - User ID
 * @param {object} options - Query options
 */
const getUserNotifications = async (userId, options = {}) => {
  const {
    page = 1,
    limit = 20,
    unreadOnly = false,
  } = options;

  const query = { user: userId };
  if (unreadOnly) {
    query.isRead = false;
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({
    user: userId,
    isRead: false,
  });

  return {
    notifications,
    total,
    unreadCount,
    page,
    pages: Math.ceil(total / limit),
  };
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 */
const markAsRead = async (notificationId) => {
  return await Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );
};

/**
 * Mark all notifications as read
 * @param {string} userId - User ID
 */
const markAllAsRead = async (userId) => {
  return await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true }
  );
};

/**
 * Delete notification
 * @param {string} notificationId - Notification ID
 */
const deleteNotification = async (notificationId) => {
  return await Notification.findByIdAndDelete(notificationId);
};

module.exports = {
  initializeSocket,
  createNotification,
  sendBookingNotification,
  sendPaymentNotification,
  sendReviewNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
