const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Patient email is required'],
      lowercase: true,
      trim: true,
    },
    claimAmount: {
      type: Number,
      required: [true, 'Claim amount is required'],
      min: [0.01, 'Claim amount must be greater than 0'],
    },
    approvedAmount: {
      type: Number,
      default: null,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    documentUrl: {
      type: String,
      required: [true, 'Document URL/path is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Approved', 'Rejected'],
        message: 'Status must be Pending, Approved, or Rejected',
      },
      default: 'Pending',
    },
    insurerComments: {
      type: String,
      default: null,
    },
    submissionDate: {
      type: Date,
      default: Date.now,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Claim = mongoose.model('Claim', claimSchema);

module.exports = Claim;
