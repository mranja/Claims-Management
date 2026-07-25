const User = require('../models/User');
const { ApiError, sendSuccess } = require('../utils/response');

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatarUrl: user.avatarUrl,
});

const updateMe = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail, _id: { $ne: req.user._id } });
    if (existingUser) throw new ApiError(409, 'An account already uses this email address');

    req.user.name = name.trim();
    req.user.email = normalizedEmail;
    await req.user.save();
    return sendSuccess(res, 200, 'Profile updated successfully', { user: publicUser(req.user) });
  } catch (error) {
    next(error);
  }
};

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, 'Please choose a PNG or JPG image under 5MB');
    req.user.avatarUrl = `/uploads/${req.file.filename}`;
    await req.user.save();
    return sendSuccess(res, 200, 'Profile photo updated successfully', { user: publicUser(req.user) });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user || !user.passwordHash || !(await user.comparePassword(currentPassword))) {
      throw new ApiError(401, 'Your current password is incorrect');
    }
    user.passwordHash = await User.hashPassword(newPassword);
    await user.save();
    return sendSuccess(res, 200, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { updateMe, uploadAvatar, changePassword };
