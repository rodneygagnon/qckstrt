import { Injectable, Logger } from '@nestjs/common';
import { DataSourceOptions } from 'typeorm';
import {
  IRelationalDBProvider,
  RelationalDBType,
  RelationalDBError,
} from '../types';

/**
 * Aurora PostgreSQL configuration
 */
export interface AuroraConfig {
  database: string;
  secretArn: string;
  resourceArn: string;
  region: string;
}

/**
 * Aurora PostgreSQL Provider (AWS)
 *
 * AWS Aurora Serverless with Data API for serverless deployments.
 *
 * Setup:
 * 1. Create Aurora Serverless cluster in AWS
 * 2. Enable Data API
 * 3. Store credentials in AWS Secrets Manager
 * 4. Configure ARNs in config
 *
 * Pros:
 * - Serverless (auto-scaling)
 * - No connection management
 * - AWS-native integration
 * - Cost-effective for variable workloads
 *
 * Cons:
 * - AWS-specific (vendor lock-in)
 * - Data API has some limitations
 * - Cold start latency possible
 */
@Injectable()
export class AuroraProvider implements IRelationalDBProvider {
  private readonly logger = new Logger(AuroraProvider.name);

  constructor(private readonly config: AuroraConfig) {
    this.logger.log(
      `Aurora provider initialized: ${config.database} in ${config.region}`,
    );
  }

  getName(): string {
    return 'Aurora PostgreSQL';
  }

  getType(): RelationalDBType {
    return RelationalDBType.AuroraPostgreSQL;
  }

  getConnectionOptions(
    entities: DataSourceOptions['entities'],
  ): DataSourceOptions {
    return {
      type: 'aurora-postgres' as any, // TypeORM aurora-data-api driver
      database: this.config.database,
      secretArn: this.config.secretArn,
      resourceArn: this.config.resourceArn,
      region: this.config.region,
      entities,
      synchronize: true,
      logging: false,
      keepConnectionAlive: true,
      serviceConfigOptions: {
        // Additional AWS SDK RDS client options
      },
      formatOptions: {
        // Data API format options
        enableUuidHack: true,
      },
    } as DataSourceOptions;
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Aurora availability depends on AWS credentials and network
      return true;
    } catch (error) {
      this.logger.error('Aurora availability check failed:', error);
      return false;
    }
  }
}
