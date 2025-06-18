import winston from 'winston';
import { Request, Response } from 'express';

const { combine, timestamp, printf, colorize } = winston.format;

// Custom log format with timestamps
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let metaString = '';
  if (Object.keys(metadata).length > 0) {
    metaString = JSON.stringify(metadata);
  }
  return `${timestamp} [${level}]: ${message} ${metaString}`;
});

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }), logFormat),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }), logFormat),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: Function) => {
  const start = Date.now();

  // Log when the request finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;

    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration,
      ip: req.ip,
      requestId: req.headers['x-request-id'] || '',
      userAgent: req.headers['user-agent'] || '',
    };

    if (res.statusCode >= 400) {
      logger.error(message, logData);
    } else {
      logger.info(message, logData);
    }
  });

  next();
};

// Import the request logger utility
import { getRequestLogger } from './get-request-logger';

// Export the logger instance and utilities
export { getRequestLogger };
export default logger;
