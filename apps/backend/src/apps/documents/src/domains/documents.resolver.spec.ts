/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';

import { DocumentsResolver } from './documents.resolver';
import { DocumentsService } from './documents.service';
import { File } from './models/file.model';
import { DocumentStatus } from 'src/common/enums/document.status.enum';

describe('DocumentsResolver', () => {
  let documentsResolver: DocumentsResolver;
  let documentsService: DocumentsService;

  const mockFiles: File[] = [
    {
      userId: 'user-1',
      filename: 'file1.pdf',
      size: 1024,
      status: DocumentStatus.AIEMBEDDINGSCOMPLETE,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      userId: 'user-1',
      filename: 'file2.txt',
      size: 512,
      status: DocumentStatus.PROCESSINGNPENDING,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsResolver,
        {
          provide: DocumentsService,
          useValue: createMock<DocumentsService>(),
        },
      ],
    }).compile();

    documentsResolver = module.get<DocumentsResolver>(DocumentsResolver);
    documentsService = module.get<DocumentsService>(DocumentsService);
  });

  it('resolver and services should be defined', () => {
    expect(documentsResolver).toBeDefined();
    expect(documentsService).toBeDefined();
  });

  describe('listFiles', () => {
    it('should return list of files for a user', async () => {
      documentsService.listFiles = jest.fn().mockResolvedValue(mockFiles);

      const result = await documentsResolver.listFiles('user-1');

      expect(result).toEqual(mockFiles);
      expect(documentsService.listFiles).toHaveBeenCalledWith('user-1');
    });

    it('should return empty array when no files found', async () => {
      documentsService.listFiles = jest.fn().mockResolvedValue([]);

      const result = await documentsResolver.listFiles('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('getUploadUrl', () => {
    it('should return upload URL', async () => {
      const mockUrl = 'https://s3.example.com/upload-url';
      documentsService.getUploadUrl = jest.fn().mockResolvedValue(mockUrl);

      const result = await documentsResolver.getUploadUrl('user-1', 'test.pdf');

      expect(result).toBe(mockUrl);
      expect(documentsService.getUploadUrl).toHaveBeenCalledWith(
        'user-1',
        'test.pdf',
      );
    });
  });

  describe('getDownloadUrl', () => {
    it('should return download URL', async () => {
      const mockUrl = 'https://s3.example.com/download-url';
      documentsService.getDownloadUrl = jest.fn().mockResolvedValue(mockUrl);

      const result = await documentsResolver.getDownloadUrl(
        'user-1',
        'test.pdf',
      );

      expect(result).toBe(mockUrl);
      expect(documentsService.getDownloadUrl).toHaveBeenCalledWith(
        'user-1',
        'test.pdf',
      );
    });
  });

  describe('deleteFile', () => {
    it('should return true when file is deleted', async () => {
      documentsService.deleteFile = jest.fn().mockResolvedValue(true);

      const result = await documentsResolver.deleteFile('user-1', 'test.pdf');

      expect(result).toBe(true);
      expect(documentsService.deleteFile).toHaveBeenCalledWith(
        'user-1',
        'test.pdf',
      );
    });

    it('should return false when file deletion fails', async () => {
      documentsService.deleteFile = jest.fn().mockResolvedValue(false);

      const result = await documentsResolver.deleteFile('user-1', 'test.pdf');

      expect(result).toBe(false);
    });
  });

  describe('user', () => {
    it('should resolve user field', () => {
      const file = mockFiles[0];

      const result = documentsResolver.user(file);

      expect(result).toEqual({ id: 'user-1' });
    });
  });
});
