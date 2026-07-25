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

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(404, 'No ClaimsCare account exists for this email address');
  }

  let isMatch = false;
  if (user.passwordHash) {
    isMatch = await user.comparePassword(password);
  } else {
    // Older versions persisted `password` outside the current Mongoose schema.
    // Read it from the raw collection so it can be verified once and migrated safely.
    const rawUser = await User.collection.findOne({ _id: user._id }, { projection: { password: 1 } });
    const legacyPassword = rawUser?.password;

    if (typeof legacyPassword === 'string') {
      const legacyIsHash = /^\$2[aby]\$\d{2}\$/.test(legacyPassword);
      isMatch = legacyIsHash
        ? await bcrypt.compare(password, legacyPassword)
        : legacyPassword === password;
    }

    if (!isMatch) {
      throw new ApiError(401, 'Incorrect password. Please try again.');
    }

    user.passwordHash = await User.hashPassword(password);
    await user.save();
    await User.collection.updateOne({ _id: user._id }, { $unset: { password: '' } });
  }

  if (!isMatch) {
    throw new ApiError(401, 'Incorrect password. Please try again.');
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
    },
  };
};

const registerUser = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(400, 'User with this email already exists');
  }

  const passwordHash = await User.hashPassword(password);

  const newUser = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: role || 'patient',
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
    },
  };
};

module.exports = {
  loginUser,
  registerUser,
};
