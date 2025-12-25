const express = require('express');
const { body, param } = require('express-validator');
const { userController } = require('../controllers');
const { authenticate, adminOnly, validate } = require('../middlewares');

const router = express.Router();

// Validation rules
const createUserValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'staff'])
    .withMessage('Role must be either admin or staff')
];

const updateUserValidation = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'staff'])
    .withMessage('Role must be either admin or staff')
];

// All routes require authentication and admin privileges
router.get('/', authenticate, adminOnly, userController.getAll);
router.get('/:id', authenticate, adminOnly, param('id').isMongoId().withMessage('Invalid user ID'), validate, userController.getById);
router.post('/', authenticate, adminOnly, createUserValidation, validate, userController.create);
router.put('/:id', authenticate, adminOnly, updateUserValidation, validate, userController.update);
router.delete('/:id', authenticate, adminOnly, param('id').isMongoId().withMessage('Invalid user ID'), validate, userController.delete);
router.patch('/:id/toggle-status', authenticate, adminOnly, param('id').isMongoId().withMessage('Invalid user ID'), validate, userController.toggleStatus);

module.exports = router;
