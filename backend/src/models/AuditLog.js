const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    userEmail: {
      type: String,
      default: 'system',
    },
    claimId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Claim',
      default: null,
    },
    actionType: {
      type: String,
      enum: [
        'DOCUMENT_OCR_EXTRACTION',
        'DOCUMENT_CLASSIFICATION',
        'STRUCTURED_DATA_EXTRACTION',
        'CLAIM_INTELLIGENCE_ANALYSIS',
        'CONSISTENCY_CHECK',
        'RISK_ASSESSMENT',
        'POLICY_RAG_QUERY',
        'ADJUDICATION_RECOMMENDATION',
        'INSURER_FINAL_ADJUDICATION',
        'PATIENT_AI_ASSISTANCE',
      ],
      required: true,
    },
    model: {
      type: String,
      default: 'ClaimIQ-Intelligence-v2.4',
    },
    inputTokens: {
      type: Number,
      default: 0,
    },
    outputTokens: {
      type: Number,
      default: 0,
    },
    latencyMs: {
      type: Number,
      default: 120,
    },
    confidenceScore: {
      type: Number,
      default: 95,
    },
    recommendation: {
      type: String,
      default: null,
    },
    finalDecision: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
