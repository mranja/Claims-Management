const mongoose = require('mongoose');

const policyChunkSchema = new mongoose.Schema(
  {
    chunkId: { type: String, required: true },
    section: { type: String, required: true },
    page: { type: Number, default: 1 },
    content: { type: String, required: true },
    embedding: [{ type: Number }], // Vector embedding representations
  },
  { _id: false }
);

const policyDocumentSchema = new mongoose.Schema(
  {
    policyCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    coverageType: {
      type: String,
      enum: ['Comprehensive Health', 'Preventive Care', 'Emergency Inpatient', 'Specialty Surgery', 'Dental & Vision'],
      default: 'Comprehensive Health',
    },
    maxAnnualLimit: {
      type: Number,
      default: 50000,
    },
    deductible: {
      type: Number,
      default: 250,
    },
    copayPercentage: {
      type: Number,
      default: 10,
    },
    waitingPeriodMonths: {
      type: Number,
      default: 0,
    },
    inclusions: [{ type: String }],
    exclusions: [{ type: String }],
    chunks: [policyChunkSchema],
    documentUrl: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const PolicyDocument = mongoose.model('PolicyDocument', policyDocumentSchema);

module.exports = PolicyDocument;
