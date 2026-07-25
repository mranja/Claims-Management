const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginRules, registerRules } = require('../utils/validators');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/login', loginRules, authController.login);
router.post('/register', registerRules, authController.register);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
