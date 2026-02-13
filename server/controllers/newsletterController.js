const Newsletter = require('../models/Newsletter');
const { sendNewsletterEmail } = require('../utils/emailService');

/**
 * @desc    Subscribe to newsletter
 * @route   POST /api/newsletter/subscribe
 * @access  Public
 */
const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if already subscribed
    const existingSubscription = await Newsletter.findOne({ email });

    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Email is already subscribed to newsletter',
        });
      } else {
        // Reactivate subscription
        existingSubscription.isActive = true;
        existingSubscription.subscribedAt = Date.now();
        await existingSubscription.save();

        return res.status(200).json({
          success: true,
          message: 'Newsletter subscription reactivated',
          data: {
            subscription: existingSubscription,
          },
        });
      }
    }

    // Create new subscription
    const subscription = await Newsletter.create({ email });

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      data: {
        subscription,
      },
    });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to newsletter',
      error: error.message,
    });
  }
};

/**
 * @desc    Unsubscribe from newsletter
 * @route   POST /api/newsletter/unsubscribe
 * @access  Public
 */
const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    const subscription = await Newsletter.findOne({ email });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in newsletter subscriptions',
      });
    }

    subscription.isActive = false;
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from newsletter',
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe from newsletter',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all newsletter subscribers
 * @route   GET /api/newsletter/subscribers
 * @access  Private (Admin only)
 */
const getSubscribers = async (req, res) => {
  try {
    const { page = 1, limit = 50, isActive } = req.query;

    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const subscribers = await Newsletter.find(query)
      .sort('-subscribedAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Newsletter.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        subscribers,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        total: count,
      },
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscribers',
      error: error.message,
    });
  }
};

/**
 * @desc    Send newsletter to all active subscribers
 * @route   POST /api/newsletter/send
 * @access  Private (Admin only)
 */
const sendNewsletter = async (req, res) => {
  try {
    const { subject, content } = req.body;

    if (!subject || !content) {
      return res.status(400).json({
        success: false,
        message: 'Subject and content are required',
      });
    }

    // Get all active subscribers
    const subscribers = await Newsletter.find({ isActive: true });

    if (subscribers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active subscribers found',
      });
    }

    // Send newsletter to all subscribers
    const result = await sendNewsletterEmail(subscribers, subject, content);

    res.status(200).json({
      success: true,
      message: `Newsletter sent to ${result.successful} out of ${result.total} subscribers`,
      data: {
        successful: result.successful,
        failed: result.failed,
        total: result.total,
      },
    });
  } catch (error) {
    console.error('Send newsletter error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send newsletter',
      error: error.message,
    });
  }
};

module.exports = {
  subscribe,
  unsubscribe,
  getSubscribers,
  sendNewsletter,
};
