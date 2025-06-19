import app from './app';
import config from './config';
import logger from './utils/logger';
import fs from 'fs';
import path from 'path';

// Ensure logs directory exists
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const PORT = config.port;

logger.info(`Starting server in ${config.env} mode...`);

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${config.env} mode on http://localhost:${PORT}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });

  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });
  process.exit(1);
});
