const express = require('express');
const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationById,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', getNotifications);
router.put('/read-all', csrfProtection, markAllNotificationsAsRead);
router.put('/:id/read', csrfProtection, markNotificationAsRead);
router.delete('/:id', csrfProtection, deleteNotificationById);

module.exports = router;
