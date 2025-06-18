import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  status: string;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorMiddleware = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const status = err instanceof AppError ? err.status : 'error';
  const message = err instanceof AppError ? err.message : 'Something went wrong';

  const requestId = req.headers['x-request-id'] || 'unknown';

  const logData = {
    requestId,
    path: req.path,
    method: req.method,
    statusCode,
    errorName: err.name,
    stack: err.stack,
  };

  logger.error(`Error processing request: ${message}`, logData);

  res.status(statusCode).json({
    status,
    message,
    requestId,
  });
};
