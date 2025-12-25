const express = require('express');
const { body, param, query } = require('express-validator');
const { taskController } = require('../controllers');
const { authenticate, adminOnly, validate } = require('../middlewares');

const router = express.Router();

// Validation rules
const createTaskValidation = [
  body('taskId')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Task ID cannot exceed 20 characters'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Task name is required')
    .isLength({ max: 200 })
    .withMessage('Task name cannot exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Task description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('area')
    .notEmpty()
    .withMessage('Area is required')
    .isMongoId()
    .withMessage('Invalid area ID'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a positive integer')
];

const updateTaskValidation = [
  param('id').isMongoId().withMessage('Invalid task ID'),
  body('taskId')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Task ID cannot exceed 20 characters'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Task name cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('area')
    .optional()
    .isMongoId()
    .withMessage('Invalid area ID'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a positive integer')
];

// Routes - All require authentication
router.get('/', authenticate, taskController.getAll);
router.get('/:id', authenticate, param('id').isMongoId().withMessage('Invalid task ID'), validate, taskController.getById);

// Admin only routes
router.post('/', authenticate, adminOnly, createTaskValidation, validate, taskController.create);
router.put('/:id', authenticate, adminOnly, updateTaskValidation, validate, taskController.update);
router.delete('/:id', authenticate, adminOnly, param('id').isMongoId().withMessage('Invalid task ID'), validate, taskController.delete);
router.patch('/:id/toggle-status', authenticate, adminOnly, param('id').isMongoId().withMessage('Invalid task ID'), validate, taskController.toggleStatus);

module.exports = router;
