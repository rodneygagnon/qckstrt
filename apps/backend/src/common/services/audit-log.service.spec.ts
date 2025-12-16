import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditLogService } from './audit-log.service';
import { AuditLogEntity } from '../../db/entities/audit-log.entity';
import { AuditAction } from '../enums/audit-action.enum';
import { IAuditLogCreate } from '../interfaces/audit.interface';
import { LOGGER } from '@qckstrt/logging-provider';
import { AUDIT_CONFIG } from '../audit/audit.module';

describe('AuditLogService', () => {
  let service: AuditLogService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    insert: jest.fn(),
    delete: jest.fn(),
  };

  const mockLogger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  const defaultConfig = {
    retentionDays: 90,
    cleanupIntervalMs: 86400000,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        {
          provide: getRepositoryToken(AuditLogEntity),
          useValue: mockRepository,
        },
        {
          provide: LOGGER,
          useValue: mockLogger,
        },
        {
          provide: AUDIT_CONFIG,
          useValue: defaultConfig,
        },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
  });

  afterEach(async () => {
    jest.useRealTimers();
    await service.onModuleDestroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    const createAuditEntry = (
      overrides: Partial<IAuditLogCreate> = {},
    ): IAuditLogCreate => ({
      requestId: 'req-123',
      serviceName: 'test-service',
      action: AuditAction.READ,
      success: true,
      ...overrides,
    });

    it('should queue audit log entry', async () => {
      const entry = createAuditEntry();

      await service.log(entry);

      // Entry should be queued, not immediately persisted
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should mask sensitive data in input variables', async () => {
      const entry = createAuditEntry({
        inputVariables: {
          password: 'secret123',
          email: 'test@example.com',
          username: 'john',
        },
      });

      mockRepository.create.mockImplementation(
        (data) => data as AuditLogEntity,
      );
      mockRepository.save.mockResolvedValue([]);

      await service.log(entry);

      // Trigger flush
      jest.advanceTimersByTime(5001);
      await Promise.resolve(); // Allow async operations to complete

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          inputVariables: expect.objectContaining({
            password: '[REDACTED]',
            username: 'john',
          }),
        }),
      );
    });

    it('should process queue when batch size is reached', async () => {
      mockRepository.create.mockImplementation(
        (data) => data as AuditLogEntity,
      );
      mockRepository.save.mockResolvedValue([]);

      // Add 100 entries to trigger batch processing
      for (let i = 0; i < 100; i++) {
        await service.log(createAuditEntry({ requestId: `req-${i}` }));
      }

      // Should have triggered save
      await Promise.resolve();
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('logSync', () => {
    it('should immediately persist audit log', async () => {
      const entry: IAuditLogCreate = {
        requestId: 'req-123',
        serviceName: 'test-service',
        action: AuditAction.LOGIN_FAILED,
        success: false,
        errorMessage: 'Invalid credentials',
      };

      const mockEntity = { id: 'audit-1', ...entry } as AuditLogEntity;
      mockRepository.create.mockReturnValue(mockEntity);
      mockRepository.save.mockResolvedValue(mockEntity);

      const result = await service.logSync(entry);

      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalledWith(mockEntity);
      expect(result).toBe(mockEntity);
    });

    it('should mask sensitive data in sync logs', async () => {
      const entry: IAuditLogCreate = {
        requestId: 'req-123',
        serviceName: 'test-service',
        action: AuditAction.LOGIN,
        success: true,
        inputVariables: { password: 'secret' },
      };

      mockRepository.create.mockImplementation(
        (data) => data as AuditLogEntity,
      );
      mockRepository.save.mockImplementation(
        async (entity) => entity as AuditLogEntity,
      );

      await service.logSync(entry);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          inputVariables: { password: '[REDACTED]' },
        }),
      );
    });
  });

  describe('periodic flush', () => {
    it('should flush queue periodically', async () => {
      mockRepository.create.mockImplementation(
        (data) => data as AuditLogEntity,
      );
      mockRepository.save.mockResolvedValue([]);

      await service.log({
        requestId: 'req-1',
        serviceName: 'test',
        action: AuditAction.READ,
        success: true,
      });

      // Advance timer to trigger flush
      jest.advanceTimersByTime(5001);
      await Promise.resolve();

      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should flush remaining entries on shutdown', async () => {
      mockRepository.create.mockImplementation(
        (data) => data as AuditLogEntity,
      );
      mockRepository.save.mockResolvedValue([]);

      await service.log({
        requestId: 'req-1',
        serviceName: 'test',
        action: AuditAction.READ,
        success: true,
      });

      await service.onModuleDestroy();

      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('retention cleanup', () => {
    it('should delete records older than retention period', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 50 });

      const deletedCount = await service.cleanupOldRecords();

      expect(mockRepository.delete).toHaveBeenCalledWith({
        timestamp: expect.any(Object),
      });
      expect(deletedCount).toBe(50);
    });

    it('should return 0 when no records deleted', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      const deletedCount = await service.cleanupOldRecords();

      expect(deletedCount).toBe(0);
    });

    it('should handle delete errors gracefully', async () => {
      mockRepository.delete.mockRejectedValue(new Error('Database error'));

      const deletedCount = await service.cleanupOldRecords();

      expect(deletedCount).toBe(0);
    });

    it('should run cleanup on module init', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 10 });

      await service.onModuleInit();

      expect(mockRepository.delete).toHaveBeenCalled();
    });

    it('should log cleanup results when records deleted', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 100 });

      await service.cleanupOldRecords();

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Cleaned up 100 audit log records'),
        'AuditLogService',
      );
    });
  });

  describe('retention cleanup with zero retention', () => {
    let serviceWithNoRetention: AuditLogService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AuditLogService,
          {
            provide: getRepositoryToken(AuditLogEntity),
            useValue: mockRepository,
          },
          {
            provide: LOGGER,
            useValue: mockLogger,
          },
          {
            provide: AUDIT_CONFIG,
            useValue: { retentionDays: 0, cleanupIntervalMs: 86400000 },
          },
        ],
      }).compile();

      serviceWithNoRetention = module.get<AuditLogService>(AuditLogService);
    });

    afterEach(async () => {
      await serviceWithNoRetention.onModuleDestroy();
    });

    it('should skip cleanup when retention is 0 (indefinite)', async () => {
      const deletedCount = await serviceWithNoRetention.cleanupOldRecords();

      expect(mockRepository.delete).not.toHaveBeenCalled();
      expect(deletedCount).toBe(0);
    });

    it('should not start cleanup timer on init when retention is 0', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await serviceWithNoRetention.onModuleInit();

      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });
});
