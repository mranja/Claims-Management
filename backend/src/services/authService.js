const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { ApiError } = require('../utils/response');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'super_secret_claims_jwt_key_2026',
    { expiresIn: '7d' }
  );
};

const loginUser = async (email, password) => {
  if (!email || !password) {
    throw new ApiError(400, 'Please provide both email and password');
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: cleanEmail });

  if (!user) {
    throw new ApiError(404, 'No ClaimsCare account exists for this email address');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Incorrect password. Please verify your credentials.');
  }

  // Ensure password is migrated to bcrypt hash if it was stored plainly or in legacy field
  if (!user.passwordHash || !/^\$2[aby]\$\d{2}\$/.test(user.passwordHash)) {
    user.passwordHash = await User.hashPassword(password);
    user.password = undefined;
    await user.save();
  }

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      phone: user.phone || '',
      policyNumber: user.policyNumber || '',
    },
  };
};

const registerUser = async ({ name, email, password, role, phone, policyNumber }) => {
  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email, and password are required.');
  }

  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters long.');
  }

  const cleanEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: cleanEmail });
  if (existingUser) {
    throw new ApiError(400, 'An account with this email address already exists. Please log in.');
  }

  const passwordHash = await User.hashPassword(password);

  const newUser = await User.create({
    name: name.trim(),
    email: cleanEmail,
    passwordHash,
    role: role === 'insurer' ? 'insurer' : 'patient',
    phone: phone ? phone.trim() : '',
    policyNumber: policyNumber ? policyNumber.trim() : '',
  });

  const token = generateToken(newUser);

  return {
    token,
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatarUrl: newUser.avatarUrl,
      phone: newUser.phone,
      policyNumber: newUser.policyNumber,
    },
  };
};

module.exports = {
  loginUser,
  registerUser,
};
