const Claim = require('../models/Claim');
const { ApiError } = require('../utils/response');

const createClaim = async (patientUser, { name, email, claimAmount, description }, file) => {
  if (!file) {
    throw new ApiError(400, 'Claim document (receipt/prescription) file is required');
  }

  const documentUrl = `/uploads/${file.filename}`;

  const claim = await Claim.create({
    patientId: patientUser._id,
    name: name || patientUser.name,
    email: email || patientUser.email,
    claimAmount: parseFloat(claimAmount),
    description,
    documentUrl,
    status: 'Pending',
    submissionDate: new Date(),
  });

  return claim;
};

const getPatientClaims = async (patientId) => {
  const claims = await Claim.find({ patientId }).sort({ submissionDate: -1 });
  return claims;
};

const getAllClaims = async ({ status, minAmount, maxAmount, fromDate, toDate }) => {
  const filter = {};

  if (status) {
    filter.status = status;
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
      // Set to end of day if only date is passed
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);
      filter.submissionDate.$lte = endDate;
    }
  }

  const claims = await Claim.find(filter)
    .populate('patientId', 'name email')
    .populate('reviewedBy', 'name email')
    .sort({ submissionDate: -1 });

  return claims;
};

const getClaimById = async (claimId) => {
  const claim = await Claim.findById(claimId)
    .populate('patientId', 'name email')
    .populate('reviewedBy', 'name email');

  if (!claim) {
    throw new ApiError(404, 'Claim not found');
  }

  return claim;
};

const updateClaimStatus = async (claimId, { status, approvedAmount, insurerComments }, reviewerUser) => {
  const claim = await Claim.findById(claimId);

  if (!claim) {
    throw new ApiError(404, 'Claim not found');
  }

  // Strict state transition rule: Only Pending -> Approved or Pending -> Rejected
  if (claim.status !== 'Pending') {
    throw new ApiError(
      400,
      `Invalid status transition. Claim status is currently '${claim.status}' and can only be updated when 'Pending'`
    );
  }

  if (!['Approved', 'Rejected'].includes(status)) {
    throw new ApiError(400, "New status must be either 'Approved' or 'Rejected'");
  }

  let finalApprovedAmount = null;

  if (status === 'Approved') {
    if (approvedAmount === undefined || approvedAmount === null || approvedAmount === '') {
      finalApprovedAmount = claim.claimAmount; // Default to full requested amount if not specified
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
  claim.reviewedBy = reviewerUser._id;
  claim.reviewedAt = new Date();

  await claim.save();

  return await Claim.findById(claimId)
    .populate('patientId', 'name email')
    .populate('reviewedBy', 'name email');
};

module.exports = {
  createClaim,
  getPatientClaims,
  getAllClaims,
  getClaimById,
  updateClaimStatus,
};
