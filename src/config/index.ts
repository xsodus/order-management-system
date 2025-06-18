import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  logFormat: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
};

export default config;
