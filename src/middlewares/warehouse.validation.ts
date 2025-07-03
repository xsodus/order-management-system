import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult, ValidationChain } from 'express-validator';

// Middleware to validate request
const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Run all validations in parallel
    await Promise.all(validations.map(validation => validation.run(req)));

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

// Validation for create warehouse endpoint
export const validateCreateWarehouse = validate([
  body('name')
    .notEmpty()
    .withMessage('Warehouse name is required')
    .isString()
    .withMessage('Warehouse name must be a string')
    .isLength({ min: 1, max: 100 })
    .withMessage('Warehouse name must be between 1 and 100 characters'),

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

  body('stock')
    .notEmpty()
    .withMessage('Stock is required')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
]);

// Validation for update warehouse stock endpoint
export const validateUpdateWarehouseStock = validate([
  param('id')
    .notEmpty()
    .withMessage('Warehouse ID is required')
    .isUUID()
    .withMessage('Warehouse ID must be a valid UUID'),

  body('stock')
    .notEmpty()
    .withMessage('Stock is required')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
]);

// Validation for warehouse ID parameter
export const validateWarehouseId = validate([
  param('id')
    .notEmpty()
    .withMessage('Warehouse ID is required')
    .isUUID()
    .withMessage('Warehouse ID must be a valid UUID'),
]);
