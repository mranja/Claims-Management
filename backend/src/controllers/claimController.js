const claimService = require('../services/claimService');
const { sendSuccess } = require('../utils/response');

const createClaim = async (req, res, next) => {
  try {
    const claim = await claimService.createClaim(req.user, req.body, req.file);
    return sendSuccess(res, 201, 'Claim submitted successfully', claim);
  } catch (error) {
    next(error);
  }
};

const getMyClaims = async (req, res, next) => {
  try {
    const claims = await claimService.getPatientClaims(req.user._id);
    return sendSuccess(res, 200, 'Claims retrieved successfully', claims);
  } catch (error) {
    next(error);
  }
};

const getAllClaims = async (req, res, next) => {
  try {
    const claims = await claimService.getAllClaims(req.query);
    return sendSuccess(res, 200, 'All claims retrieved successfully', claims);
  } catch (error) {
    next(error);
  }
};

const getClaimById = async (req, res, next) => {
  try {
    const claim = await claimService.getClaimById(req.params.id);
    return sendSuccess(res, 200, 'Claim retrieved successfully', claim);
  } catch (error) {
    next(error);
  }
};

const updateClaimStatus = async (req, res, next) => {
  try {
    const updatedClaim = await claimService.updateClaimStatus(req.params.id, req.body, req.user);
    return sendSuccess(res, 200, `Claim status updated to ${updatedClaim.status}`, updatedClaim);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createClaim,
  getMyClaims,
  getAllClaims,
  getClaimById,
  updateClaimStatus,
};
