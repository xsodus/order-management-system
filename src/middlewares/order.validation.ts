import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import { OrderStatus } from '../models/order.model';

// Middleware to validate request
const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.context.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      next();
      return;
    }

    res.status(400).json({
      status: 'error',
      errors: errors.array(),
    });
  };
};

export const validateCreateOrder = validate([
  body('customerId')
    .notEmpty()
    .withMessage('Customer ID is required')
    .isString()
    .withMessage('Customer ID must be a string'),

  body('customerName')
    .notEmpty()
    .withMessage('Customer name is required')
    .isString()
    .withMessage('Customer name must be a string'),

  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),

  body('items.*.productId')
    .notEmpty()
    .withMessage('Product ID is required for each item')
    .isString()
    .withMessage('Product ID must be a string'),

  body('items.*.productName')
    .notEmpty()
    .withMessage('Product name is required for each item')
    .isString()
    .withMessage('Product name must be a string'),

  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required for each item')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),

  body('items.*.unitPrice')
    .notEmpty()
    .withMessage('Unit price is required for each item')
    .isFloat({ min: 0.01 })
    .withMessage('Unit price must be a positive number'),
]);

export const validateUpdateOrderStatus = validate([
  param('id')
    .notEmpty()
    .withMessage('Order ID is required')
    .isUUID()
    .withMessage('Invalid Order ID format'),

  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(Object.values(OrderStatus))
    .withMessage('Invalid status value'),
]);

export const validateAddOrderItem = validate([
  param('id')
    .notEmpty()
    .withMessage('Order ID is required')
    .isUUID()
    .withMessage('Invalid Order ID format'),

  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isString()
    .withMessage('Product ID must be a string'),

  body('productName')
    .notEmpty()
    .withMessage('Product name is required')
    .isString()
    .withMessage('Product name must be a string'),

  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),

  body('unitPrice')
    .notEmpty()
    .withMessage('Unit price is required')
    .isFloat({ min: 0.01 })
    .withMessage('Unit price must be a positive number'),
]);

export const validateUpdateOrderItem = validate([
  param('id')
    .notEmpty()
    .withMessage('Order ID is required')
    .isUUID()
    .withMessage('Invalid Order ID format'),

  param('itemId')
    .notEmpty()
    .withMessage('Item ID is required')
    .isUUID()
    .withMessage('Invalid Item ID format'),

  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),

  body('unitPrice')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Unit price must be a positive number'),
]);

export const validateRemoveOrderItem = validate([
  param('id')
    .notEmpty()
    .withMessage('Order ID is required')
    .isUUID()
    .withMessage('Invalid Order ID format'),

  param('itemId')
    .notEmpty()
    .withMessage('Item ID is required')
    .isUUID()
    .withMessage('Invalid Item ID format'),
]);

export const validateGetOrderById = validate([
  param('id')
    .notEmpty()
    .withMessage('Order ID is required')
    .isUUID()
    .withMessage('Invalid Order ID format'),
]);

export const validateDeleteOrder = validate([
  param('id')
    .notEmpty()
    .withMessage('Order ID is required')
    .isUUID()
    .withMessage('Invalid Order ID format'),
]);

export const validateOrderFilters = validate([
  query('customerId').optional().isString().withMessage('Customer ID must be a string'),

  query('status').optional().isIn(Object.values(OrderStatus)).withMessage('Invalid status value'),

  query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO8601 date'),

  query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO8601 date'),

  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
]);
