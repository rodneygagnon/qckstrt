import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { AuditAction } from '../../common/enums/audit-action.enum';

@Entity('audit_logs')
@Index(['userId', 'timestamp'])
@Index(['entityType', 'entityId'])
@Index(['action', 'timestamp'])
export class AuditLogEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  // Action Information
  @Column({ type: 'varchar', length: 50 })
  public action!: AuditAction;

  // Entity Information (what was accessed)
  @Column({ type: 'varchar', length: 100, nullable: true })
  public entityType?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  public entityId?: string;

  // Actor Information (who performed the action)
  @Column({ type: 'uuid', nullable: true })
  @Index()
  public userId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  public userEmail?: string;

  // Request Metadata
  @Column({ type: 'uuid' })
  public requestId!: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  public ipAddress?: string;

  @Column({ type: 'text', nullable: true })
  public userAgent?: string;

  // GraphQL-specific
  @Column({ type: 'varchar', length: 100, nullable: true })
  public operationName?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  public operationType?: string; // 'query' | 'mutation' | 'subscription'

  @Column({ type: 'varchar', length: 100, nullable: true })
  public resolverName?: string;

  // Input/Output (with PII masking applied)
  @Column({ type: 'jsonb', nullable: true })
  public inputVariables?: Record<string, unknown>;

  // Result Information
  @Column({ type: 'boolean', default: true })
  public success!: boolean;

  @Column({ type: 'int', nullable: true })
  public statusCode?: number;

  @Column({ type: 'text', nullable: true })
  public errorMessage?: string;

  // Change tracking for updates
  @Column({ type: 'jsonb', nullable: true })
  public previousValues?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  public newValues?: Record<string, unknown>;

  // Timing
  @Column({ type: 'int', nullable: true })
  public durationMs?: number;

  // Service identification (for microservices)
  @Column({ type: 'varchar', length: 50 })
  public serviceName!: string;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @Index()
  public timestamp!: Date;
}
