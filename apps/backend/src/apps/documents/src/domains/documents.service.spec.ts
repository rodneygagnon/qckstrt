/* eslint-disable @typescript-eslint/no-unused-vars */

import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { DocumentsService } from './documents.service';
import { DocumentEntity } from 'src/db/entities/document.entity';
import { IStorageProvider } from '@qckstrt/storage-provider';
import { DocumentStatus } from 'src/common/enums/document.status.enum';

describe('DocumentsService', () => {
  let documentsService: DocumentsService;
  let documentRepo: Repository<DocumentEntity>;
  let storage: IStorageProvider;
  let configService: ConfigService;

  const mockFileConfig = {
    bucket: 'test-bucket',
    region: 'us-west-2',
  };

  const mockDocuments: Partial<DocumentEntity>[] = [
    {
      id: 'doc-1',
      userId: 'user-1',
      key: 'file1.pdf',
      size: 1024,
      status: DocumentStatus.AIEMBEDDINGSCOMPLETE,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 'doc-2',
      userId: 'user-1',
      key: 'file2.txt',
      size: 512,
      status: DocumentStatus.PROCESSINGNPENDING,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: getRepositoryToken(DocumentEntity),
          useValue: createMock<Repository<DocumentEntity>>(),
        },
        {
          provide: 'STORAGE_PROVIDER',
          useValue: createMock<IStorageProvider>(),
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(mockFileConfig),
          },
        },
      ],
    }).compile();

    documentsService = module.get<DocumentsService>(DocumentsService);
    documentRepo = module.get<Repository<DocumentEntity>>(
      getRepositoryToken(DocumentEntity),
    );
    storage = module.get<IStorageProvider>('STORAGE_PROVIDER');
    configService = module.get<ConfigService>(ConfigService);
  });

  it('services should be defined', () => {
    expect(documentsService).toBeDefined();
    expect(documentRepo).toBeDefined();
    expect(storage).toBeDefined();
  });

  describe('listFiles', () => {
    it('should return list of files for a user', async () => {
      documentRepo.find = jest.fn().mockResolvedValue(mockDocuments);

      const files = await documentsService.listFiles('user-1');

      expect(files).toHaveLength(2);
      expect(files[0].filename).toBe('file1.pdf');
      expect(files[0].userId).toBe('user-1');
      expect(documentRepo.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });

    it('should return empty array when no documents found', async () => {
      documentRepo.find = jest.fn().mockResolvedValue(null);

      const files = await documentsService.listFiles('user-1');

      expect(files).toEqual([]);
    });
  });

  describe('getUploadUrl', () => {
    it('should return signed upload URL', async () => {
      const mockUrl = 'https://s3.example.com/upload-url';
      storage.getSignedUrl = jest.fn().mockResolvedValue(mockUrl);

      const url = await documentsService.getUploadUrl('user-1', 'test.pdf');

      expect(url).toBe(mockUrl);
      expect(storage.getSignedUrl).toHaveBeenCalledWith(
        'test-bucket',
        'user-1/test.pdf',
        true,
      );
    });
  });

  describe('getDownloadUrl', () => {
    it('should return signed download URL', async () => {
      const mockUrl = 'https://s3.example.com/download-url';
      storage.getSignedUrl = jest.fn().mockResolvedValue(mockUrl);

      const url = await documentsService.getDownloadUrl('user-1', 'test.pdf');

      expect(url).toBe(mockUrl);
      expect(storage.getSignedUrl).toHaveBeenCalledWith(
        'test-bucket',
        'user-1/test.pdf',
        false,
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete file and metadata successfully', async () => {
      storage.deleteFile = jest.fn().mockResolvedValue(true);
      documentRepo.delete = jest.fn().mockResolvedValue({ affected: 1 });

      const result = await documentsService.deleteFile('user-1', 'test.pdf');

      expect(result).toBe(true);
      expect(storage.deleteFile).toHaveBeenCalledWith(
        'test-bucket',
        'user-1/test.pdf',
      );
      expect(documentRepo.delete).toHaveBeenCalledWith({
        userId: 'user-1',
        key: 'test.pdf',
      });
    });

    it('should return false when S3 deletion fails', async () => {
      storage.deleteFile = jest.fn().mockResolvedValue(false);

      const result = await documentsService.deleteFile('user-1', 'test.pdf');

      expect(result).toBe(false);
      expect(documentRepo.delete).not.toHaveBeenCalled();
    });

    it('should throw error on storage error', async () => {
      storage.deleteFile = jest
        .fn()
        .mockRejectedValue(new Error('Storage error'));

      await expect(
        documentsService.deleteFile('user-1', 'test.pdf'),
      ).rejects.toThrow('Storage error');
    });
  });

  describe('getDocumentById', () => {
    it('should return document by ID', async () => {
      documentRepo.findOne = jest.fn().mockResolvedValue(mockDocuments[0]);

      const doc = await documentsService.getDocumentById('doc-1');

      expect(doc).toEqual(mockDocuments[0]);
      expect(documentRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'doc-1' },
      });
    });

    it('should return null when document not found', async () => {
      documentRepo.findOne = jest.fn().mockResolvedValue(null);

      const doc = await documentsService.getDocumentById('unknown');

      expect(doc).toBeNull();
    });
  });

  describe('createDocument', () => {
    it('should create document metadata', async () => {
      const newDoc = {
        id: 'new-doc',
        location: 's3://bucket/path',
        userId: 'user-1',
        key: 'new-file.pdf',
        size: 2048,
        checksum: 'abc123',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };
      documentRepo.save = jest.fn().mockResolvedValue(newDoc);

      const result = await documentsService.createDocument(
        's3://bucket/path',
        'user-1',
        'new-file.pdf',
        2048,
        'abc123',
      );

      expect(result).toEqual(newDoc);
      expect(documentRepo.save).toHaveBeenCalledWith({
        location: 's3://bucket/path',
        userId: 'user-1',
        key: 'new-file.pdf',
        size: 2048,
        checksum: 'abc123',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  describe('updateDocument', () => {
    it('should update document metadata', async () => {
      documentRepo.update = jest.fn().mockResolvedValue({ affected: 1 });

      await documentsService.updateDocument('doc-1', {
        status: DocumentStatus.AIEMBEDDINGSCOMPLETE,
      });

      expect(documentRepo.update).toHaveBeenCalledWith('doc-1', {
        status: DocumentStatus.AIEMBEDDINGSCOMPLETE,
      });
    });
  });
});

describe('DocumentsService - config validation', () => {
  it('should throw error when file config is missing', async () => {
    await expect(
      Test.createTestingModule({
        providers: [
          DocumentsService,
          {
            provide: getRepositoryToken(DocumentEntity),
            useValue: createMock<Repository<DocumentEntity>>(),
          },
          {
            provide: 'STORAGE_PROVIDER',
            useValue: createMock<IStorageProvider>(),
          },
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn().mockReturnValue(undefined),
            },
          },
        ],
      }).compile(),
    ).rejects.toThrow('File storage config is missing');
  });
});
