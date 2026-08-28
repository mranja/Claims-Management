const mongoose = require('mongoose');

const inconsistencySchema = new mongoose.Schema(
  {
    field: { type: String, required: true },
    claimValue: { type: mongoose.Schema.Types.Mixed, default: null },
    docValue: { type: mongoose.Schema.Types.Mixed, default: null },
    status: {
      type: String,
      enum: ['MATCH', 'MISMATCH', 'NOT_FOUND'],
      default: 'NOT_FOUND',
    },
    explanation: { type: String, default: '' },
  },
  { _id: false }
);

const riskFlagSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    title: { type: String, required: true },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW',
    },
    explanation: { type: String, required: true },
  },
  { _id: false }
);

const policyCitationSchema = new mongoose.Schema(
  {
    policyName: { type: String, default: 'Standard Health Comprehensive' },
    section: { type: String, default: 'General Coverage' },
    page: { type: Number, default: 1 },
    clauseText: { type: String, default: '' },
  },
  { _id: false }
);

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
    policyNumber: {
      type: String,
      default: 'POL-GEN-2026',
      trim: true,
    },
    hospitalName: {
      type: String,
      default: 'City General Hospital',
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
        values: ['Pending', 'Approved', 'Rejected', 'Requires Info'],
        message: 'Status must be Pending, Approved, Rejected, or Requires Info',
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

    // ─── Phase 1: Intelligent Document Processing ───
    documentProcessing: {
      status: {
        type: String,
        enum: ['UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED'],
        default: 'UPLOADED',
      },
      extractedText: { type: String, default: '' },
      documentType: {
        type: String,
        enum: [
          'Medical Bill / Invoice',
          'Prescription',
          'Discharge Summary',
          'Diagnostic Report',
          'Receipt',
          'Other Evidence',
          'UNKNOWN',
        ],
        default: 'Medical Bill / Invoice',
      },
      classificationConfidence: { type: Number, default: 94 },
      structuredData: {
        patientName: { type: String, default: null },
        hospitalOrProvider: { type: String, default: null },
        doctorName: { type: String, default: null },
        invoiceNumber: { type: String, default: null },
        invoiceDate: { type: String, default: null },
        diagnosis: { type: String, default: null },
        procedure: { type: String, default: null },
        totalAmount: { type: Number, default: null },
        medicines: [
          {
            name: String,
            quantity: Number,
            cost: Number,
          },
        ],
        policyNumber: { type: String, default: null },
      },
      processedAt: { type: Date, default: null },
    },

    // ─── Phase 2: AI Claim Intelligence ───
    aiAssessment: {
      category: { type: String, default: 'General Medical' },
      summary: { type: String, default: '' },
      inconsistencies: [inconsistencySchema],
      missingDocuments: [{ type: String }],
      confidenceScore: { type: Number, default: 92 },
      modelVersion: { type: String, default: 'ClaimIQ-Intelligence-v2.4' },
      analyzedAt: { type: Date, default: null },
    },

    // ─── Phase 3: Risk & Fraud Intelligence ───
    riskAssessment: {
      riskScore: { type: Number, default: 12 }, // 0 - 100
      riskLevel: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'LOW',
      },
      ruleFlags: [riskFlagSchema],
      mlScore: { type: Number, default: 15 },
      isDuplicate: { type: Boolean, default: false },
      duplicateMatches: [
        {
          claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim' },
          similarity: Number,
          matchedFields: [String],
        },
      ],
      explanation: { type: String, default: '' },
    },

    // ─── Phase 4 & 5: AI-Assisted Adjudication & Policy Grounding ───
    adjudicationRecommendation: {
      recommendedAction: {
        type: String,
        enum: ['APPROVE', 'REJECT', 'REQUEST_MORE_INFORMATION'],
        default: 'APPROVE',
      },
      recommendedAmount: { type: Number, default: 0 },
      requestedAmount: { type: Number, default: 0 },
      deductionAmount: { type: Number, default: 0 },
      deductionReasons: [{ type: String }],
      policyGrounding: [policyCitationSchema],
      rationale: { type: String, default: '' },
      confidence: { type: Number, default: 95 },
    },

    // Insurer audit trail
    adjudicationDecisionType: {
      type: String,
      enum: ['Accepted AI Recommendation', 'Modified AI Recommendation', 'Manual Review Adjudication', 'None'],
      default: 'None',
    },
  },
  {
    timestamps: true,
  }
);

const Claim = mongoose.model('Claim', claimSchema);

module.exports = Claim;
