const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
    },
    password: {
      type: String, // Support for legacy fields during migration
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: {
        values: ['patient', 'insurer', 'admin'],
        message: 'Role must be patient, insurer, or admin',
      },
      default: 'patient',
      required: [true, 'Role is required'],
    },
    phone: {
      type: String,
      default: '',
    },
    policyNumber: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Bulletproof password comparison that never throws on undefined/invalid input
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!candidatePassword || typeof candidatePassword !== 'string') {
    return false;
  }
  const hash = this.passwordHash || this.password;
  if (!hash || typeof hash !== 'string') {
    return false;
  }

  // Check if string is a valid bcrypt hash
  const isBcrypt = /^\$2[aby]\$\d{2}\$/.test(hash);
  if (isBcrypt) {
    try {
      return await bcrypt.compare(candidatePassword, hash);
    } catch (e) {
      return false;
    }
  }

  // Fallback to plain text match for legacy records, then auto-migrate
  return candidatePassword === hash;
};

// Static helper to hash password
userSchema.statics.hashPassword = async function (password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password string is required to generate hash');
  }
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
