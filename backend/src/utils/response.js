class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, statusCode = 500, message = 'Internal Server Error', data = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data,
  });
};

module.exports = {
  ApiError,
  sendSuccess,
  sendError,
};
