import { Sequelize } from 'sequelize';
import logger from '../utils/logger';
import config from './index';

// Initialize Sequelize with dynamic database configuration
export const sequelize = new Sequelize({
  dialect: config.database.dialect,
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  username: config.database.username,
  password: config.database.password,
  logging: config.database.logging,
  pool: config.database.pool,
  dialectOptions: {
    ssl: config.env === 'production' ? { rejectUnauthorized: false } : false,
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
});

// Test database connection
export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info(`Database connection established successfully using ${config.database.dialect}`);
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }
};

// Sync all models with database
export const initDatabase = async (): Promise<void> => {
  try {
    await testConnection();
    // Enable PostGIS extension
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    logger.info('PostGIS extension enabled');
    await sequelize.sync({ force: config.env !== 'production' });
    logger.info('All models were synchronized successfully.');
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
};

// Close database connection
export const closeConnection = async (): Promise<void> => {
  try {
    await sequelize.close();
    logger.info('Database connection closed successfully.');
  } catch (error) {
    logger.error('Error closing database connection:', error);
    throw error;
  }
};
