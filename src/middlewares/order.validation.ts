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

// Validation for verify order endpoint
export const validateVerifyOrder = validate([
  query('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),

  query('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a number between -90 and 90'),

  query('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a number between -180 and 180'),
]);

// Validation for create order endpoint
export const validateCreateOrder = validate([
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),

  body('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a number between -90 and 90'),

  body('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a number between -180 and 180'),
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

export const validateUpdateOrderItem = validate([
  param('id')
    .notEmpty()
    .withMessage('Order ID is required')
    .isUUID()
    .withMessage('Invalid Order ID format'),
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
