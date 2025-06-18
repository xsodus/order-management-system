import dotenv from 'dotenv';
import path from 'path';

// Determine which environment file to load
const env = process.env.NODE_ENV || 'development';
const envFile = `.env.${env}`;

// Load environment variables from the appropriate file
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// Fallback to default .env if specific env file doesn't exist
dotenv.config();

interface DatabaseConfig {
  dialect: 'mysql' | 'sqlite';
  host?: string;
  port?: number;
  database: string;
  username: string;
  password: string;
  storage?: string;
  logging: boolean | ((sql: string) => void);
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
}

interface Config {
  env: string;
  port: number;
  cors: {
    origin: string;
  };
  logFormat: string;
  logLevel: string;
  database: DatabaseConfig;
  swagger: {
    enabled: boolean;
  };
  api: {
    prefix: string;
  };
}

const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  logFormat: process.env.LOG_FORMAT || (process.env.NODE_ENV === 'production' ? 'combined' : 'dev'),
  logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  database: {
    dialect: (process.env.DB_DIALECT as 'mysql' | 'sqlite') || 'sqlite',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    database: process.env.DB_NAME || 'order_management_db',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'order-management',
    storage: process.env.NODE_ENV === 'test' ? ':memory:' : undefined,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  swagger: {
    enabled: process.env.SWAGGER_ENABLED === 'true',
  },
  api: {
    prefix: process.env.API_PREFIX || '/api',
  },
};

export default config;
