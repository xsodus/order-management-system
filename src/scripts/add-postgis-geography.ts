import { sequelize } from '../config/database';
import { QueryTypes } from 'sequelize';
import logger from '../utils/logger';

/**
 * Migration script to add PostGIS GEOGRAPHY column to warehouses table
 * and populate it with existing latitude/longitude data
 */
async function addPostGISGeography() {
  try {
    logger.info('Starting PostGIS GEOGRAPHY migration...');

    // Check if we're using PostgreSQL
    if (sequelize.getDialect() !== 'postgres') {
      logger.warn('PostGIS GEOGRAPHY is only available for PostgreSQL. Skipping migration.');
      return;
    }

    // Ensure PostGIS extension is enabled
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    logger.info('PostGIS extension enabled');

    // Check if location column already exists
    const columns = await sequelize.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = 'warehouses' AND column_name = 'location';`,
      { type: QueryTypes.SELECT },
    );

    if (columns.length === 0) {
      // Add the location column as GEOGRAPHY(POINT, 4326)
      await sequelize.query('ALTER TABLE warehouses ADD COLUMN location GEOGRAPHY(POINT, 4326);');
      logger.info('Added location column as GEOGRAPHY(POINT, 4326)');
    } else {
      logger.info('Location column already exists, skipping column creation');
    }

    // Update existing warehouses with location data from latitude and longitude
    const result = await sequelize.query(
      `UPDATE warehouses 
       SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography 
       WHERE location IS NULL AND latitude IS NOT NULL AND longitude IS NOT NULL;`,
      { type: QueryTypes.UPDATE },
    );

    logger.info(`Updated ${result[1]} warehouse records with PostGIS GEOGRAPHY data`);

    // Create an index on the location column for better performance
    try {
      await sequelize.query(
        'CREATE INDEX IF NOT EXISTS idx_warehouses_location ON warehouses USING GIST (location);',
      );
      logger.info('Created spatial index on location column');
    } catch (error: any) {
      // Index might already exist, log but don't fail
      logger.warn('Spatial index creation failed or already exists:', error.message);
    }

    // Verify the migration by counting warehouses with location data
    const locationCount = await sequelize.query(
      'SELECT COUNT(*) as count FROM warehouses WHERE location IS NOT NULL;',
      { type: QueryTypes.SELECT },
    );

    const totalCount = await sequelize.query('SELECT COUNT(*) as count FROM warehouses;', {
      type: QueryTypes.SELECT,
    });

    const withLocation = (locationCount[0] as any).count;
    const total = (totalCount[0] as any).count;

    logger.info(`Migration completed: ${withLocation}/${total} warehouses have location data`);

    if (withLocation < total) {
      logger.warn(`${total - withLocation} warehouses are missing location data`);
    }
  } catch (error: any) {
    logger.error('PostGIS GEOGRAPHY migration failed:', error.message);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  addPostGISGeography()
    .then(() => {
      logger.info('PostGIS GEOGRAPHY migration completed successfully');
      process.exit(0);
    })
    .catch(error => {
      logger.error('PostGIS GEOGRAPHY migration failed:', error);
      process.exit(1);
    });
}

export { addPostGISGeography };
