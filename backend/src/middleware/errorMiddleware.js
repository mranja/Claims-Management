const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.name}: ${err.message}`);
  if (err.stack && process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let data = null;

  // Handle Mongoose Bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = 'Resource not found / Invalid ID format';
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(', ');
  }

  // Handle Multer File Upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File size exceeds limit of 5MB';
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Authorization denied.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired. Please log in again.';
  }

  return sendError(res, statusCode, message, data);
};

const notFound = (req, res, next) => {
  return sendError(res, 404, `Route not found - ${req.originalUrl}`);
};

module.exports = {
  errorHandler,
  notFound,
};
