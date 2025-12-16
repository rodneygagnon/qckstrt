import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditLogService } from './audit-log.service';
import { AuditLogEntity } from '../../db/entities/audit-log.entity';
import { AuditAction } from '../enums/audit-action.enum';
import { IAuditLogCreate } from '../interfaces/audit.interface';
import { LOGGER } from '@qckstrt/logging-provider';

describe('AuditLogService', () => {
  let service: AuditLogService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    insert: jest.fn(),
  };

  const mockLogger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
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
});
