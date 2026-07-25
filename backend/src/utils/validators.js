const { body, validationResult } = require('express-validator');
const { ApiError } = require('./response');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg).join(', ');
    return next(new ApiError(400, errorMessages));
  }
  next();
};

const loginRules = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').optional().isIn(['patient', 'insurer']).withMessage('Role must be patient or insurer'),
  handleValidationErrors,
];

const createClaimRules = [
  body('claimAmount')
    .notEmpty()
    .withMessage('Claim amount is required')
    .isFloat({ gt: 0 })
    .withMessage('Claim amount must be a number greater than 0'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  handleValidationErrors,
];

const updateStatusRules = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Approved', 'Rejected'])
    .withMessage('Status must be Approved or Rejected'),
  body('approvedAmount')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Approved amount must be a non-negative number'),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  loginRules,
  registerRules,
  createClaimRules,
  updateStatusRules,
};
