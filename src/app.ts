import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

// Import routes
import orderRoutes from './routes/order.routes';

// Import middleware
import { errorMiddleware, AppError } from './middlewares/error.middleware';
import { requestIdMiddleware } from './middlewares/request-id.middleware';

// Import config
import config from './config';
import { specs } from './config/swagger.config';
import { setupDatabase } from './config/db-setup';

// Import logger
import logger, { requestLogger } from './utils/logger';

const app: Express = express();

// Initialize database
setupDatabase().catch(err => {
  logger.error('Failed to initialize database:', {
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

// Middleware
app.use(requestIdMiddleware); // Add request ID to all requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: config.cors.origin,
  }),
);
app.use(helmet());
app.use(morgan(config.logFormat));
app.use(requestLogger); // Add our custom request logger

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Order Management API',
    version: '1.0.0',
    status: 'active',
  });
});

// API routes
app.use('/api/orders', orderRoutes);

// Swagger documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Order Management API Documentation',
  }),
);

// Handle 404 errors
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(errorMiddleware);

export default app;
