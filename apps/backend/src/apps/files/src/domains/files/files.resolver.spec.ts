/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';

import { File } from './models/file.model';
import { FilesResolver } from './files.resolver';
import { FilesService } from './files.service';

import { documents } from '../../../../data.spec';

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
      return documents;
    });

    expect(resolver.listFiles(documents[0].userId)).toEqual(documents);
    expect(filesService.listFiles).toHaveBeenCalledTimes(1);
  });

  it('should get a file upload url', () => {
    filesService.getUploadUrl = jest
      .fn()
      .mockImplementation((userId: string, filename: string) => {
        return `http://aws.s3.com/${userId}/${filename}`;
      });

    expect(resolver.getUploadUrl(documents[0].userId, 'myfile.pdf')).toBe(
      `http://aws.s3.com/${documents[0].userId}/myfile.pdf`,
    );
    expect(filesService.getUploadUrl).toHaveBeenCalledTimes(1);
  });

  it('should get a file download url', () => {
    filesService.getDownloadUrl = jest
      .fn()
      .mockImplementation((userId: string, filename: string) => {
        return `http://aws.s3.com/${userId}/${filename}`;
      });

    expect(resolver.getDownloadUrl(documents[0].userId, 'myfile.pdf')).toBe(
      `http://aws.s3.com/${documents[0].userId}/myfile.pdf`,
    );
    expect(filesService.getDownloadUrl).toHaveBeenCalledTimes(1);
  });

  it('should get an answer to a query', async () => {
    filesService.answerQuery = jest
      .fn()
      .mockImplementation((userId: string, query: string) => {
        return Promise.resolve(`Answer to your query <${userId}/${query}>`);
      });

    expect(await resolver.answerQuery(documents[0].userId, 'My Query')).toBe(
      `Answer to your query <${documents[0].userId}/My Query>`,
    );
    expect(filesService.answerQuery).toHaveBeenCalledTimes(1);
  });

  it('should get text(s) for a query', async () => {
    filesService.searchText = jest
      .fn()
      .mockImplementation((userId: string, query: string, count: number) => {
        return Promise.resolve([
          `Text(s) related to your query <${userId}/${query}/${count}>`,
        ]);
      });

    expect(
      await resolver.searchText(documents[0].userId, 'My Query', 1),
    ).toStrictEqual([
      `Text(s) related to your query <${documents[0].userId}/My Query/1>`,
    ]);
    expect(filesService.searchText).toHaveBeenCalledTimes(1);
  });

  it('should delete a file', async () => {
    filesService.deleteFile = jest
      .fn()
      .mockImplementation((userId: string, filename: string) => {
        return Promise.resolve(true);
      });

    expect(await resolver.deleteFile(documents[0].userId, 'myfile.pdf')).toBe(
      true,
    );
    expect(filesService.deleteFile).toHaveBeenCalledTimes(1);
  });

  it('should resolve the user of a file', () => {
    const result = resolver.user(documents[0] as any);
    expect(result).toEqual(
      expect.objectContaining({
        id: documents[0].userId,
      }),
    );
  });
});
