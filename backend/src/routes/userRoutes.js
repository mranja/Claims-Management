const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../utils/validators');
const userController = require('../controllers/userController');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.patch('/me', authenticate, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please provide a valid email address'),
  handleValidationErrors,
], userController.updateMe);

router.patch('/me/avatar', authenticate, upload.single('avatar'), userController.uploadAvatar);

router.patch('/me/password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
  handleValidationErrors,
], userController.changePassword);

// Insurer: Patient Directory
router.get('/patients', authenticate, authorizeRoles('insurer', 'admin'), userController.getAllPatients);

module.exports = router;
