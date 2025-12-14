import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IRelationalDBProvider } from './types';
import {
  PostgresProvider,
  PostgresConfig,
} from './providers/postgres.provider';
import { AuroraProvider, AuroraConfig } from './providers/aurora.provider';
import { SQLiteProvider, SQLiteConfig } from './providers/sqlite.provider';

/**
 * Relational Database Module
 *
 * Configures Dependency Injection for relational database providers.
 *
 * To swap providers, change the RELATIONAL_DB_PROVIDER factory:
 * - sqlite (default for development, zero setup!)
 * - postgres (production, local or cloud)
 * - aurora (AWS Aurora Serverless)
 * - Add your own implementation of IRelationalDBProvider
 */
@Module({
  providers: [
    // Relational DB provider selection
    {
      provide: 'RELATIONAL_DB_PROVIDER',
      useFactory: (configService: ConfigService): IRelationalDBProvider => {
        // Check if we're in development/test mode
        const nodeEnv = configService.get<string>('NODE_ENV') || 'development';

        // Default to SQLite for development (zero setup!)
        const provider =
          configService.get<string>('relationaldb.provider') ||
          (nodeEnv === 'production' ? 'postgres' : 'sqlite');

        let dbProvider: IRelationalDBProvider;

        switch (provider.toLowerCase()) {
          case 'postgres':
          case 'postgresql':
            // OSS: PostgreSQL (production standard)
            const postgresConfig: PostgresConfig = {
              host:
                configService.get<string>('relationaldb.postgres.host') ||
                'localhost',
              port:
                configService.get<number>('relationaldb.postgres.port') || 5432,
              database:
                configService.get<string>('relationaldb.postgres.database') ||
                'qckstrt',
              username:
                configService.get<string>('relationaldb.postgres.username') ||
                'postgres',
              password:
                configService.get<string>('relationaldb.postgres.password') ||
                'postgres',
              ssl:
                configService.get<boolean>('relationaldb.postgres.ssl') ||
                false,
            };

            dbProvider = new PostgresProvider(postgresConfig);
            break;

          case 'aurora':
          case 'aurora-postgres':
            // AWS: Aurora Serverless
            const auroraConfig: AuroraConfig = {
              database:
                configService.get<string>('relationaldb.aurora.database') ||
                'qckstrt',
              secretArn:
                configService.get<string>('relationaldb.aurora.secretArn') ||
                '',
              resourceArn:
                configService.get<string>('relationaldb.aurora.resourceArn') ||
                '',
              region:
                configService.get<string>('AWS_REGION') ||
                configService.get<string>('region') ||
                'us-east-1',
            };

            dbProvider = new AuroraProvider(auroraConfig);
            break;

          case 'sqlite':
          default:
            // OSS: SQLite (development/testing - zero setup!)
            const sqliteConfig: SQLiteConfig = {
              database:
                configService.get<string>('relationaldb.sqlite.database') ||
                (nodeEnv === 'test' ? ':memory:' : './data/dev.sqlite'),
            };

            dbProvider = new SQLiteProvider(sqliteConfig);
            break;
        }

        return dbProvider;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['RELATIONAL_DB_PROVIDER'],
})
export class RelationalDBModule {}
