const express = require('express');
const router = express.Router();
const claimController = require('../controllers/claimController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { createClaimRules, updateStatusRules } = require('../utils/validators');

// Patient routes
router.post(
  '/',
  authenticate,
  authorizeRoles('patient'),
  upload.single('file'),
  createClaimRules,
  claimController.createClaim
);

router.get(
  '/mine',
  authenticate,
  authorizeRoles('patient'),
  claimController.getMyClaims
);

// Insurer routes
router.get(
  '/',
  authenticate,
  authorizeRoles('insurer'),
  claimController.getAllClaims
);

router.get(
  '/:id',
  authenticate,
  authorizeRoles('insurer', 'patient'),
  claimController.getClaimById
);

router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles('insurer'),
  updateStatusRules,
  claimController.updateClaimStatus
);

module.exports = router;
