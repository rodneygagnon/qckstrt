/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';

import { File } from './models/file.model';
import { FilesResolver } from './files.resolver';
import { FilesService } from './files.service';

import { files } from '../../../../data.spec';

describe('FilesResolver', () => {
  let resolver: FilesResolver;
  let filesService: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesResolver,
        { provide: FilesService, useValue: createMock<FilesService>() },
      ],
    }).compile();

    resolver = module.get<FilesResolver>(FilesResolver);
    filesService = module.get<FilesService>(FilesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
    expect(filesService).toBeDefined();
  });

  it('should list all files for user', () => {
    filesService.listFiles = jest.fn().mockImplementation((userId: string) => {
      return files;
    });

    expect(resolver.listFiles(files[0].userId)).toEqual(files);
    expect(filesService.listFiles).toHaveBeenCalledTimes(1);
  });

  it('should get a file upload url', () => {
    filesService.getUploadUrl = jest
      .fn()
      .mockImplementation((userId: string, filename: string) => {
        return `http://aws.s3.com/${userId}/${filename}`;
      });

    expect(resolver.getUploadUrl(files[0].userId, 'myfile.pdf')).toBe(
      `http://aws.s3.com/${files[0].userId}/myfile.pdf`,
    );
    expect(filesService.getUploadUrl).toHaveBeenCalledTimes(1);
  });

  it('should get a file download url', () => {
    filesService.getDownloadUrl = jest
      .fn()
      .mockImplementation((userId: string, filename: string) => {
        return `http://aws.s3.com/${userId}/${filename}`;
      });

    expect(resolver.getDownloadUrl(files[0].userId, 'myfile.pdf')).toBe(
      `http://aws.s3.com/${files[0].userId}/myfile.pdf`,
    );
    expect(filesService.getDownloadUrl).toHaveBeenCalledTimes(1);
  });

  it('should delete a file', async () => {
    filesService.deleteFile = jest
      .fn()
      .mockImplementation((userId: string, filename: string) => {
        return Promise.resolve(true);
      });

    expect(await resolver.deleteFile(files[0].userId, 'myfile.pdf')).toBe(true);
    expect(filesService.deleteFile).toHaveBeenCalledTimes(1);
  });

  it('should resolve the user of a file', () => {
    const result = resolver.user(files[0] as any);
    expect(result).toEqual(
      expect.objectContaining({
        id: files[0].userId,
      }),
    );
  });
});
