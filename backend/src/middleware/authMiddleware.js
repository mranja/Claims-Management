const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError } = require('../utils/response');

const authenticate = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(401, 'Not authorized, no token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_claims_jwt_key_2026');
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return next(new ApiError(401, 'User associated with token no longer exists'));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new ApiError(401, 'Token validation failed'));
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Access denied. Role '${req.user ? req.user.role : 'guest'}' is not authorized to access this route`)
      );
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorizeRoles,
};
