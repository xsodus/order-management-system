import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';
import { Sequelize } from 'sequelize';
import logger from '../utils/logger';

class TestDatabase {
  private container: StartedTestContainer | null = null;
  private sequelize: Sequelize | null = null;

  async start(): Promise<Sequelize> {
    if (this.container && this.sequelize) {
      return this.sequelize;
    }

    try {
      logger.info('Starting PostgreSQL with PostGIS test container...');

      this.container = await new GenericContainer('postgis/postgis:16-3.4')
        .withEnvironment({
          POSTGRES_DB: 'order_management_test',
          POSTGRES_USER: 'postgres',
          POSTGRES_PASSWORD: 'test-password',
        })
        .withExposedPorts(5432)
        .withWaitStrategy(Wait.forLogMessage('database system is ready to accept connections', 2))
        .withStartupTimeout(120000)
        .start();

      const host = this.container.getHost();
      const port = this.container.getMappedPort(5432);

      logger.info(`PostgreSQL test container started at ${host}:${port}`);

      this.sequelize = new Sequelize({
        dialect: 'postgres',
        host,
        port,
        database: 'order_management_test',
        username: 'postgres',
        password: 'test-password',
        logging: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
        dialectOptions: {
          ssl: false,
        },
        define: {
          timestamps: true,
          underscored: true,
          freezeTableName: true,
        },
      });

      // Test connection with retry logic
      let retries = 5;
      while (retries > 0) {
        try {
          await this.sequelize.authenticate();
          logger.info('Test database connection established successfully');

          // Enable PostGIS extension
          await this.sequelize.query('CREATE EXTENSION IF NOT EXISTS postgis;');
          logger.info('PostGIS extension enabled in test container');
          break;
        } catch (error) {
          retries--;
          if (retries === 0) throw error;
          logger.warn(`Database connection attempt failed, retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      return this.sequelize;
    } catch (error) {
      logger.error('Failed to start test database:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      if (this.sequelize) {
        await this.sequelize.close();
        this.sequelize = null;
      }

      if (this.container) {
        await this.container.stop();
        this.container = null;
      }

      logger.info('Test database stopped successfully');
    } catch (error) {
      logger.error('Error stopping test database:', error);
      throw error;
    }
  }

  async reset(): Promise<void> {
    if (this.sequelize) {
      await this.sequelize.sync({ force: true });
      logger.info('Test database reset successfully');
    }
  }

  getSequelize(): Sequelize {
    if (!this.sequelize) {
      throw new Error('Test database not initialized. Call start() first.');
    }
    return this.sequelize;
  }
}

export const testDatabase = new TestDatabase();
