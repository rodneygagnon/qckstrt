import { registerAs } from '@nestjs/config';

/**
 * Relational Database Configuration
 *
 * Maps RELATIONAL_DB_* environment variables to nested config.
 */
export default registerAs('relationaldb', () => ({
  provider: process.env.RELATIONAL_DB_PROVIDER || 'postgres',
  postgres: {
    host: process.env.RELATIONAL_DB_HOST || 'localhost',
    port: Number.parseInt(process.env.RELATIONAL_DB_PORT || '5432', 10),
    database: process.env.RELATIONAL_DB_DATABASE || 'postgres',
    username: process.env.RELATIONAL_DB_USERNAME || 'postgres',
    password: process.env.RELATIONAL_DB_PASSWORD || 'postgres',
    ssl: process.env.RELATIONAL_DB_SSL === 'true',
  },
}));
