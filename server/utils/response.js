/**
 * Send error response with appropriate message based on environment
 */
const sendErrorResponse = (res, statusCode, message, error = null) => {
  const response = {
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? message 
      : (error?.message || message),
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development' && error?.stack) {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * Send success response
 */
const sendSuccessResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message,
  };

  if (data) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};

module.exports = {
  sendErrorResponse,
  sendSuccessResponse,
};
