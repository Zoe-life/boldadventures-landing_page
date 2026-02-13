const AuditLog = require('../models/AuditLog');

/**
 * Create audit log entry
 */
const createAuditLog = async (user, action, resource, resourceId = null, details = {}, status = 'SUCCESS', req = null) => {
  try {
    const logData = {
      user: user._id || user,
      action,
      resource,
      status,
      details,
    };

    if (resourceId) {
      logData.resourceId = resourceId;
    }

    if (req) {
      logData.ipAddress = req.ip || req.connection.remoteAddress;
      logData.userAgent = req.get('user-agent');
    }

    await AuditLog.create(logData);
  } catch (error) {
    // Don't throw error if audit logging fails - just log it
    console.error('Audit log error:', error);
  }
};

/**
 * Middleware to automatically log certain actions
 */
const auditLogger = (action, resource) => {
  return async (req, res, next) => {
    // Store original send method
    const originalSend = res.send;

    // Override send method to capture response
    res.send = function (data) {
      // Restore original send
      res.send = originalSend;

      // Check if request was successful
      const status = res.statusCode >= 200 && res.statusCode < 300 ? 'SUCCESS' : 'FAILURE';

      // Create audit log
      if (req.user) {
        const resourceId = req.params.id || req.body.id || null;
        const details = {
          method: req.method,
          path: req.path,
          body: sanitizeBody(req.body),
          query: req.query,
        };

        createAuditLog(req.user, action, resource, resourceId, details, status, req);
      }

      // Call original send
      return originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Sanitize body to remove sensitive information
 */
function sanitizeBody(body) {
  if (!body) return {};
  
  const sanitized = { ...body };
  
  // Remove sensitive fields
  delete sanitized.password;
  delete sanitized.refreshToken;
  delete sanitized.accessToken;
  
  return sanitized;
}

module.exports = {
  createAuditLog,
  auditLogger,
};
