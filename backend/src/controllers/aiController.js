const claimService = require('../services/claimService');
const policyRagService = require('../services/policyRagService');
const auditService = require('../services/auditService');
const Claim = require('../models/Claim');
const PolicyDocument = require('../models/PolicyDocument');
const { sendSuccess, ApiError } = require('../utils/response');

const reanalyzeClaim = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedClaim = await claimService.reanalyzeClaim(id, req.user);
    return sendSuccess(res, 200, 'Claim intelligence reanalyzed successfully', { claim: updatedClaim });
  } catch (error) {
    next(error);
  }
};

const queryPolicyRag = async (req, res, next) => {
  try {
    const { query, policyCode } = req.body;
    if (!query) {
      throw new ApiError(400, 'Search query string is required');
    }

    const result = await policyRagService.answerPolicyQuery(query, policyCode);

    await auditService.logAiAction({
      userId: req.user._id,
      userEmail: req.user.email,
      actionType: 'POLICY_RAG_QUERY',
      metadata: { query, policyCode },
      confidenceScore: result.confidence,
    });

    return sendSuccess(res, 200, 'Policy knowledge retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

const getPolicies = async (req, res, next) => {
  try {
    await policyRagService.ensurePoliciesSeeded();
    const policies = await PolicyDocument.find().lean();
    return sendSuccess(res, 200, 'Policy documents retrieved', { policies });
  } catch (error) {
    next(error);
  }
};

const createPolicy = async (req, res, next) => {
  try {
    const { policyCode, title, coverageType, maxAnnualLimit, deductible, copayPercentage, inclusions, exclusions, chunks } = req.body;
    if (!policyCode || !title) {
      throw new ApiError(400, 'Policy code and title are required');
    }

    const existing = await PolicyDocument.findOne({ policyCode: policyCode.trim().toUpperCase() });
    if (existing) {
      throw new ApiError(400, 'A policy with this policy code already exists');
    }

    const newPolicy = await PolicyDocument.create({
      policyCode: policyCode.trim().toUpperCase(),
      title: title.trim(),
      coverageType: coverageType || 'Comprehensive Health',
      maxAnnualLimit: Number(maxAnnualLimit) || 50000,
      deductible: Number(deductible) || 250,
      copayPercentage: Number(copayPercentage) || 10,
      inclusions: Array.isArray(inclusions) ? inclusions : ['Emergency Care', 'Inpatient Diagnostics'],
      exclusions: Array.isArray(exclusions) ? exclusions : ['Cosmetic Procedures'],
      chunks: Array.isArray(chunks) && chunks.length > 0 ? chunks : [
        {
          chunkId: `${policyCode}-CHUNK-01`,
          section: 'Section 1.1: Standard General Coverage',
          page: 1,
          content: `${title} provides standard medical coverage with deductible of $${deductible || 250} and ${copayPercentage || 10}% coinsurance.`,
        },
      ],
    });

    return sendSuccess(res, 201, 'Policy document created successfully', { policy: newPolicy });
  } catch (error) {
    next(error);
  }
};

const patientAssistantChat = async (req, res, next) => {
  try {
    const { message, claimId } = req.body;
    if (!message) {
      throw new ApiError(400, 'Message is required');
    }

    let claimContext = null;
    if (claimId) {
      claimContext = await Claim.findOne({ _id: claimId, patientId: req.user._id });
    } else {
      claimContext = await Claim.findOne({ patientId: req.user._id }).sort({ submissionDate: -1 });
    }

    const lower = message.toLowerCase();
    let reply = '';
    let suggestions = ['What documents are missing?', 'How is my payout calculated?', 'When will my claim be reviewed?'];

    if (claimContext) {
      if (lower.includes('status') || lower.includes('progress') || lower.includes('update')) {
        reply = `Your claim (#${claimContext._id.toString().slice(-6)}) for **$${claimContext.claimAmount}** submitted on ${new Date(claimContext.submissionDate).toLocaleDateString()} is currently in **${claimContext.status}** status. ${claimContext.status === 'Approved' ? `Approved payout amount is **$${claimContext.approvedAmount}**.` : 'Our clinical adjudication team is reviewing your itemized documentation.'}`;
      } else if (lower.includes('missing') || lower.includes('document') || lower.includes('file')) {
        const missing = claimContext.aiAssessment?.missingDocuments || [];
        if (missing.length > 0) {
          reply = `The system has identified the following recommended document(s) for your claim: **${missing.join(', ')}**. Providing these will expedite adjudication.`;
        } else {
          reply = `Great news! All required clinical invoices and diagnostic documentation for your claim appear to be fully uploaded and verified by our OCR system.`;
        }
      } else if (lower.includes('deductible') || lower.includes('payout') || lower.includes('amount') || lower.includes('reimburse')) {
        const rec = claimContext.adjudicationRecommendation;
        reply = `For your claim amount of **$${claimContext.claimAmount}**, standard insurance coverage applies an annual deductible and co-pay coinsurance. Estimated eligible benefit is **$${rec?.recommendedAmount || claimContext.claimAmount}**.`;
      } else {
        reply = `Hello ${req.user.name.split(' ')[0]}! I am your ClaimsCare Patient Assistant. Your latest claim for "${claimContext.description}" is currently **${claimContext.status}**. How can I help clarify your benefits or documentation today?`;
      }
    } else {
      reply = `Hello ${req.user.name.split(' ')[0]}! Welcome to ClaimsCare. You haven't submitted any insurance claims yet. You can submit a new claim anytime using the "Submit New Claim" button in your dashboard.`;
    }

    await auditService.logAiAction({
      userId: req.user._id,
      userEmail: req.user.email,
      claimId: claimContext?._id,
      actionType: 'PATIENT_AI_ASSISTANCE',
      metadata: { message },
    });

    return sendSuccess(res, 200, 'Assistant response generated', {
      reply,
      suggestions,
      claimId: claimContext?._id,
    });
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const analytics = await auditService.getOperationalAnalytics();
    return sendSuccess(res, 200, 'Operational analytics retrieved', analytics);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  reanalyzeClaim,
  queryPolicyRag,
  getPolicies,
  createPolicy,
  patientAssistantChat,
  getAnalytics,
};
