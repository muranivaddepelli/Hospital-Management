const express = require('express');
const { body, param } = require('express-validator');
const { areaController } = require('../controllers');
const { authenticate, adminOnly, validate } = require('../middlewares');

const router = express.Router();

// Validation rules
const createAreaValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Area name is required')
    .isLength({ max: 100 })
    .withMessage('Area name cannot exceed 100 characters'),
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Area code is required')
    .isLength({ max: 10 })
    .withMessage('Area code cannot exceed 10 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
];

const updateAreaValidation = [
  param('id').isMongoId().withMessage('Invalid area ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Area name cannot exceed 100 characters'),
  body('code')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Area code cannot exceed 10 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
];

// Routes - All require authentication
router.get('/', authenticate, areaController.getAll);
router.get('/active', authenticate, areaController.getActive);
router.get('/:id', authenticate, param('id').isMongoId().withMessage('Invalid area ID'), validate, areaController.getById);

// Admin only routes
router.post('/', authenticate, adminOnly, createAreaValidation, validate, areaController.create);
router.put('/:id', authenticate, adminOnly, updateAreaValidation, validate, areaController.update);
router.delete('/:id', authenticate, adminOnly, param('id').isMongoId().withMessage('Invalid area ID'), validate, areaController.delete);
router.patch('/:id/toggle-status', authenticate, adminOnly, param('id').isMongoId().withMessage('Invalid area ID'), validate, areaController.toggleStatus);

module.exports = router;
