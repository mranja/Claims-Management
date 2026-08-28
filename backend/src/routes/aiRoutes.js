const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

// Insurer-only AI routes
router.post('/claims/:id/reanalyze', authenticate, authorizeRoles('insurer', 'admin'), aiController.reanalyzeClaim);
router.post('/policy/query', authenticate, authorizeRoles('insurer', 'admin', 'patient'), aiController.queryPolicyRag);
router.get('/policies', authenticate, authorizeRoles('insurer', 'admin', 'patient'), aiController.getPolicies);
router.post('/policies', authenticate, authorizeRoles('insurer', 'admin'), aiController.createPolicy);
router.get('/analytics', authenticate, authorizeRoles('insurer', 'admin'), aiController.getAnalytics);

// Patient AI assistant route
router.post('/patient-chat', authenticate, authorizeRoles('patient', 'insurer', 'admin'), aiController.patientAssistantChat);

module.exports = router;
