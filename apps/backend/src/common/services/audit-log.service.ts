import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity } from '../../db/entities/audit-log.entity';
import { IAuditLogCreate } from '../interfaces/audit.interface';
import { maskSensitiveData } from '../utils/pii-masker';
import { ILogger, LOGGER } from '@qckstrt/logging-provider';

@Injectable()
export class AuditLogService implements OnModuleDestroy {
  private readonly logger: Logger;
  private readonly writeQueue: IAuditLogCreate[] = [];
  private isProcessing = false;
  private readonly batchSize = 100;
  private readonly flushInterval = 5000; // 5 seconds
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditLogRepo: Repository<AuditLogEntity>,
    @Optional() @Inject(LOGGER) private structuredLogger?: ILogger,
  ) {
    this.logger = new Logger(AuditLogService.name);
    this.startPeriodicFlush();
  }

  /**
   * Queue an audit log entry for non-blocking persistence
   */
  async log(entry: IAuditLogCreate): Promise<void> {
    // Mask sensitive data in input variables
    const maskedEntry = this.maskEntry(entry);
    this.writeQueue.push(maskedEntry);

    // Process immediately if queue is full
    if (this.writeQueue.length >= this.batchSize) {
      this.processQueue();
    }
  }

  /**
   * Synchronous logging for critical events (login failures, security events)
   */
  async logSync(entry: IAuditLogCreate): Promise<AuditLogEntity> {
    const maskedEntry = this.maskEntry(entry);
    const auditLog = this.auditLogRepo.create(maskedEntry);
    return this.auditLogRepo.save(auditLog);
  }

  private maskEntry(entry: IAuditLogCreate): IAuditLogCreate {
    return {
      ...entry,
      inputVariables: entry.inputVariables
        ? (maskSensitiveData(entry.inputVariables) as Record<string, unknown>)
        : undefined,
      previousValues: entry.previousValues
        ? (maskSensitiveData(entry.previousValues) as Record<string, unknown>)
        : undefined,
      newValues: entry.newValues
        ? (maskSensitiveData(entry.newValues) as Record<string, unknown>)
        : undefined,
    };
  }

  private startPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      if (this.writeQueue.length > 0) {
        this.processQueue();
      }
    }, this.flushInterval);
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.writeQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const batch = this.writeQueue.splice(0, this.batchSize);

    try {
      const entities = batch.map((entry) => this.auditLogRepo.create(entry));
      await this.auditLogRepo.save(entities);

      this.structuredLogger?.debug(
        `Flushed ${batch.length} audit log entries`,
        'AuditLogService',
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to persist audit logs: ${errorMessage}`,
        errorStack,
      );
      // Re-queue failed entries at the front
      this.writeQueue.unshift(...batch);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Flush remaining entries on application shutdown
   */
  async onModuleDestroy(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    // Process remaining queue entries
    while (this.writeQueue.length > 0) {
      await this.processQueue();
    }
  }
}
