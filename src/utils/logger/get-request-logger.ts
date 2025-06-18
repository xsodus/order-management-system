import { Request } from 'express';
import logger from './index';

/**
 * Creates a logger instance with request context
 * Use this in controllers/services to include request ID in all logs
 *
 * @example
 * // In a controller method
 * const log = getRequestLogger(req);
 * log.info('Processing order', { orderId });
 *
 * @param req Express Request object
 * @returns Logger instance with request context
 */
export const getRequestLogger = (req: Request) => {
  const requestId = req.headers['x-request-id'] || 'unknown';
  const method = req.method;
  const url = req.originalUrl;

  const childLogger = {
    debug: (message: string, meta: object = {}) => {
      logger.debug(message, { requestId, method, url, ...meta });
    },
    info: (message: string, meta: object = {}) => {
      logger.info(message, { requestId, method, url, ...meta });
    },
    warn: (message: string, meta: object = {}) => {
      logger.warn(message, { requestId, method, url, ...meta });
    },
    error: (message: string, meta: object = {}) => {
      logger.error(message, { requestId, method, url, ...meta });
    },
  };

  return childLogger;
};
