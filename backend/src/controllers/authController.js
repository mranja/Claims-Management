const authService = require('../services/authService');
const { sendSuccess } = require('../utils/response');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    return sendSuccess(res, 200, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const result = await authService.registerUser({ name, email, password, role });
    return sendSuccess(res, 201, 'User registered successfully', result);
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, 200, 'User profile retrieved', { user: req.user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
  getMe,
};
