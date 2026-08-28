const User = require('../models/User');
const Claim = require('../models/Claim');
const { ApiError, sendSuccess } = require('../utils/response');

const publicUser = (user) => ({
  id: user._id,
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatarUrl: user.avatarUrl,
  phone: user.phone || '',
  policyNumber: user.policyNumber || '',
  createdAt: user.createdAt,
});

const updateMe = async (req, res, next) => {
  try {
    const { name, email, phone, policyNumber } = req.body;
    const normalizedEmail = email ? email.toLowerCase().trim() : req.user.email;
    const existingUser = await User.findOne({ email: normalizedEmail, _id: { $ne: req.user._id } });
    if (existingUser) throw new ApiError(409, 'An account already uses this email address');

    if (name) req.user.name = name.trim();
    if (email) req.user.email = normalizedEmail;
    if (phone !== undefined) req.user.phone = phone.trim();
    if (policyNumber !== undefined) req.user.policyNumber = policyNumber.trim();

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
    if (!user || !(await user.comparePassword(currentPassword))) {
      throw new ApiError(401, 'Your current password is incorrect');
    }
    user.passwordHash = await User.hashPassword(newPassword);
    await user.save();
    return sendSuccess(res, 200, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

const getAllPatients = async (req, res, next) => {
  try {
    const patients = await User.find({ role: 'patient' }).sort({ createdAt: -1 }).lean();
    const claims = await Claim.find().lean();

    const patientData = patients.map((p) => {
      const pClaims = claims.filter((c) => c.patientId && c.patientId.toString() === p._id.toString());
      const totalClaimed = pClaims.reduce((sum, c) => sum + (c.claimAmount || 0), 0);
      const totalApproved = pClaims.reduce((sum, c) => sum + (c.approvedAmount || 0), 0);
      const pendingClaims = pClaims.filter((c) => c.status === 'Pending' || c.status === 'Requires Info').length;

      return {
        ...publicUser(p),
        totalClaims: pClaims.length,
        pendingClaims,
        totalClaimed: Math.round(totalClaimed * 100) / 100,
        totalApproved: Math.round(totalApproved * 100) / 100,
        latestClaimDate: pClaims[0]?.submissionDate || null,
      };
    });

    return sendSuccess(res, 200, 'Patient directory retrieved successfully', { patients: patientData });
  } catch (error) {
    next(error);
  }
};

module.exports = { updateMe, uploadAvatar, changePassword, getAllPatients };
