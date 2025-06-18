import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware that assigns a unique ID to each request
 * This helps with tracking requests throughout the application
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Use existing request ID from headers if present, otherwise generate a new one
  const requestId = req.headers['x-request-id'] || uuidv4();

  // Set the request ID in headers for downstream use
  req.headers['x-request-id'] = requestId;

  // Add it to the response headers as well
  res.setHeader('X-Request-ID', requestId as string);

  next();
};
