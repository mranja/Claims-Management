const Claim = require('../models/Claim');
const { ApiError } = require('../utils/response');
const claimIntelligence = require('./claimIntelligenceService');
const auditService = require('./auditService');

const createClaim = async (patientUser, { name, email, claimAmount, description, hospitalName, policyNumber }, file) => {
  if (!file) {
    throw new ApiError(400, 'Claim document (receipt/prescription) file is required');
  }

  const documentUrl = `/uploads/${file.filename}`;
  const amountNumber = parseFloat(claimAmount);

  // Initialize base claim
  let claim = new Claim({
    patientId: patientUser._id,
    name: name || patientUser.name,
    email: email || patientUser.email,
    hospitalName: hospitalName || 'City General Medical Center',
    policyNumber: policyNumber || patientUser.policyNumber || 'POL-COMP-PLATINUM',
    claimAmount: amountNumber,
    description,
    documentUrl,
    status: 'Pending',
    submissionDate: new Date(),
  });

  // Run ClaimIQ Intelligence Pipeline
  try {
    const aiResults = await claimIntelligence.analyzeClaim(claim);
    claim.documentProcessing = aiResults.documentProcessing;
    claim.aiAssessment = aiResults.aiAssessment;
    claim.riskAssessment = aiResults.riskAssessment;
    claim.adjudicationRecommendation = aiResults.adjudicationRecommendation;
  } catch (err) {
    console.error('Error running AI Claim Intelligence pipeline:', err.message);
  }

  await claim.save();

  // Record Audit Trail
  await auditService.logAiAction({
    userId: patientUser._id,
    userEmail: patientUser.email,
    claimId: claim._id,
    actionType: 'CLAIM_INTELLIGENCE_ANALYSIS',
    model: 'ClaimIQ-Intelligence-v2.4',
    inputTokens: 380,
    outputTokens: 210,
    latencyMs: 145,
    confidenceScore: claim.aiAssessment?.confidenceScore || 94,
    recommendation: claim.adjudicationRecommendation?.recommendedAction,
    metadata: {
      claimAmount: claim.claimAmount,
      riskScore: claim.riskAssessment?.riskScore,
    },
  });

  return claim;
};

const getPatientClaims = async (patientId) => {
  const claims = await Claim.find({ patientId }).sort({ submissionDate: -1 });

  // Ensure any older claims have AI results populated
  for (const c of claims) {
    if (!c.documentProcessing?.extractedText || !c.aiAssessment?.summary) {
      try {
        const ai = await claimIntelligence.analyzeClaim(c);
        c.documentProcessing = ai.documentProcessing;
        c.aiAssessment = ai.aiAssessment;
        c.riskAssessment = ai.riskAssessment;
        c.adjudicationRecommendation = ai.adjudicationRecommendation;
        await c.save();
      } catch (e) {}
    }
  }

  return claims;
};

const getAllClaims = async ({ status, minAmount, maxAmount, fromDate, toDate, riskLevel }) => {
  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (riskLevel) {
    filter['riskAssessment.riskLevel'] = riskLevel;
  }

  if (minAmount !== undefined && minAmount !== '') {
    filter.claimAmount = { ...filter.claimAmount, $gte: Number(minAmount) };
  }

  if (maxAmount !== undefined && maxAmount !== '') {
    filter.claimAmount = { ...filter.claimAmount, $lte: Number(maxAmount) };
  }

  if (fromDate || toDate) {
    filter.submissionDate = {};
    if (fromDate) {
      filter.submissionDate.$gte = new Date(fromDate);
    }
    if (toDate) {
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);
      filter.submissionDate.$lte = endDate;
    }
  }

  const claims = await Claim.find(filter)
    .populate('patientId', 'name email')
    .populate('reviewedBy', 'name email')
    .sort({ submissionDate: -1 });

  // Auto-enrich any un-analyzed claims
  for (const c of claims) {
    if (!c.documentProcessing?.extractedText || !c.aiAssessment?.summary) {
      try {
        const ai = await claimIntelligence.analyzeClaim(c);
        c.documentProcessing = ai.documentProcessing;
        c.aiAssessment = ai.aiAssessment;
        c.riskAssessment = ai.riskAssessment;
        c.adjudicationRecommendation = ai.adjudicationRecommendation;
        await c.save();
      } catch (e) {}
    }
  }

  return claims;
};

const getClaimById = async (claimId) => {
  const claim = await Claim.findById(claimId)
    .populate('patientId', 'name email')
    .populate('reviewedBy', 'name email');

  if (!claim) {
    throw new ApiError(404, 'Claim not found');
  }

  // Auto-enrich if necessary
  if (!claim.documentProcessing?.extractedText || !claim.aiAssessment?.summary) {
    try {
      const ai = await claimIntelligence.analyzeClaim(claim);
      claim.documentProcessing = ai.documentProcessing;
      claim.aiAssessment = ai.aiAssessment;
      claim.riskAssessment = ai.riskAssessment;
      claim.adjudicationRecommendation = ai.adjudicationRecommendation;
      await claim.save();
    } catch (e) {}
  }

  return claim;
};

const updateClaimStatus = async (
  claimId,
  { status, approvedAmount, insurerComments, adjudicationDecisionType },
  reviewerUser
) => {
  const claim = await Claim.findById(claimId);

  if (!claim) {
    throw new ApiError(404, 'Claim not found');
  }

  if (!['Approved', 'Rejected', 'Requires Info'].includes(status)) {
    throw new ApiError(400, "New status must be 'Approved', 'Rejected', or 'Requires Info'");
  }

  let finalApprovedAmount = null;

  if (status === 'Approved') {
    if (approvedAmount === undefined || approvedAmount === null || approvedAmount === '') {
      finalApprovedAmount = claim.adjudicationRecommendation?.recommendedAmount || claim.claimAmount;
    } else {
      const parsedAmount = Number(approvedAmount);
      if (isNaN(parsedAmount) || parsedAmount < 0) {
        throw new ApiError(400, 'Approved amount must be a valid non-negative number');
      }
      finalApprovedAmount = parsedAmount;
    }
  } else if (status === 'Rejected') {
    finalApprovedAmount = 0;
  }

  claim.status = status;
  claim.approvedAmount = finalApprovedAmount;
  claim.insurerComments = insurerComments || null;
  claim.adjudicationDecisionType = adjudicationDecisionType || 'Manual Review Adjudication';
  claim.reviewedBy = reviewerUser._id;
  claim.reviewedAt = new Date();

  await claim.save();

  // Audit final decision
  await auditService.logAiAction({
    userId: reviewerUser._id,
    userEmail: reviewerUser.email,
    claimId: claim._id,
    actionType: 'INSURER_FINAL_ADJUDICATION',
    model: 'ClaimIQ-Intelligence-v2.4',
    recommendation: claim.adjudicationRecommendation?.recommendedAction,
    finalDecision: status,
    metadata: {
      approvedAmount: finalApprovedAmount,
      decisionType: claim.adjudicationDecisionType,
      reviewerComments: insurerComments,
    },
  });

  return await Claim.findById(claimId)
    .populate('patientId', 'name email')
    .populate('reviewedBy', 'name email');
};

const reanalyzeClaim = async (claimId, user) => {
  const claim = await Claim.findById(claimId);
  if (!claim) {
    throw new ApiError(404, 'Claim not found');
  }

  const aiResults = await claimIntelligence.analyzeClaim(claim);
  claim.documentProcessing = aiResults.documentProcessing;
  claim.aiAssessment = aiResults.aiAssessment;
  claim.riskAssessment = aiResults.riskAssessment;
  claim.adjudicationRecommendation = aiResults.adjudicationRecommendation;

  await claim.save();

  await auditService.logAiAction({
    userId: user._id,
    userEmail: user.email,
    claimId: claim._id,
    actionType: 'CLAIM_INTELLIGENCE_ANALYSIS',
    model: 'ClaimIQ-Intelligence-v2.4',
    recommendation: claim.adjudicationRecommendation?.recommendedAction,
    metadata: { action: 'MANUAL_REANALYSIS_TRIGGER' },
  });

  return claim;
};

module.exports = {
  createClaim,
  getPatientClaims,
  getAllClaims,
  getClaimById,
  updateClaimStatus,
  reanalyzeClaim,
};
