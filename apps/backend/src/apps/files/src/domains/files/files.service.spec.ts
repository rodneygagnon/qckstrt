/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';

import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FilesService } from './files.service';
import { AI } from 'src/providers/ai';
import { Storage } from 'src/providers/files';
import { ConfigService } from '@nestjs/config';

import { config, documents, embeddings, files } from 'src/apps/data.spec';
import { DocumentEntity } from 'src/db/entities/document.entity';
import { EmbeddingEntity } from 'src/db/entities/embedding.entity';

describe('FilesService', () => {
  let fileService: FilesService;
  let documentRepo: Repository<DocumentEntity>;
  let embeddingRepo: Repository<EmbeddingEntity>;
  let ai: AI;
  let storage: Storage;
  let configService: ConfigService;

  beforeEach(async () => {
    configService = createMock<ConfigService>();

    configService.get = jest
      .fn()
      .mockImplementation((key: keyof typeof config): any => {
        return config[key];
      });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: getRepositoryToken(DocumentEntity),
          useValue: createMock<Repository<DocumentEntity>>({}),
        },
        {
          provide: getRepositoryToken(EmbeddingEntity),
          useValue: createMock<Repository<EmbeddingEntity>>({}),
        },
        { provide: Storage, useValue: createMock<Storage>() },
        { provide: AI, useValue: createMock<AI>() },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    fileService = module.get<FilesService>(FilesService);
    documentRepo = module.get<Repository<DocumentEntity>>(
      getRepositoryToken(DocumentEntity),
    );
    embeddingRepo = module.get<Repository<EmbeddingEntity>>(
      getRepositoryToken(EmbeddingEntity),
    );
    ai = module.get<AI>(AI);
    storage = module.get<Storage>(Storage);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(fileService).toBeDefined();
    expect(documentRepo).toBeDefined();
    expect(embeddingRepo).toBeDefined();
    expect(ai).toBeDefined();
    expect(storage).toBeDefined();
    expect(configService).toBeDefined();
  });

  it('should list all files for a user', async () => {
    documentRepo.find = jest.fn().mockImplementation((options: any) => {
      return documents;
    });

    expect(await fileService.listFiles('a')).toEqual(files);
    expect(documentRepo.find).toHaveBeenCalledTimes(1);
  });

  it('should get a file upload url', async () => {
    storage.getSignedUrl = jest
      .fn()
      .mockImplementation(
        (bucket: string, userId: string, filename: string, upload: boolean) => {
          return Promise.resolve(`http://aws.s3.com/${userId}/${filename}`);
        },
      );

    expect(
      await fileService.getUploadUrl(documents[0].userId, 'myfile.pdf'),
    ).toBe(`http://aws.s3.com/${documents[0].userId}/myfile.pdf`);
    expect(storage.getSignedUrl).toHaveBeenCalledTimes(1);
  });

  it('should get a file download url', async () => {
    storage.getSignedUrl = jest
      .fn()
      .mockImplementation(
        (bucket: string, userId: string, filename: string, upload: boolean) => {
          return Promise.resolve(`http://aws.s3.com/${userId}/${filename}`);
        },
      );

    expect(
      await fileService.getDownloadUrl(documents[0].userId, 'myfile.pdf'),
    ).toBe(`http://aws.s3.com/${documents[0].userId}/myfile.pdf`);
    expect(storage.getSignedUrl).toHaveBeenCalledTimes(1);
  });

  it('should get an answer to a query', async () => {
    ai.getEmbeddingsForQuery = jest.fn().mockImplementation((query: string) => {
      return Promise.resolve([0.1, 0.2, 0.3]);
    });
    embeddingRepo.query = jest
      .fn()
      .mockImplementation((query: string, parameters?: any[]) => {
        return embeddings.map((embedding: any) => ({
          ...embedding,
          similarity: 0.5,
        }));
      });

    expect(await fileService.answerQuery(documents[0].userId, 'My Query')).toBe(
      `answerQuery: ${documents[0].userId}/My Query`,
    );
    expect(ai.getEmbeddingsForQuery).toHaveBeenCalledTimes(1);
  });

  it('should get text(s) for a query', async () => {
    ai.getEmbeddingsForQuery = jest.fn().mockImplementation((query: string) => {
      return Promise.resolve([0.1, 0.2, 0.3]);
    });
    embeddingRepo.query = jest
      .fn()
      .mockImplementation((query: string, parameters?: any[]) => {
        return embeddings.map((embedding: any) => ({
          ...embedding,
          similarity: 0.5,
        }));
      });

    expect(
      await fileService.searchText(documents[0].userId, 'My Query', 1),
    ).toStrictEqual([`searchText: ${documents[0].userId}/My Query/1`]);
    expect(ai.getEmbeddingsForQuery).toHaveBeenCalledTimes(1);
  });

  it('should delete a file', async () => {
    storage.deleteFile = jest
      .fn()
      .mockImplementation(
        (userId: string, filename: string, upload: boolean) => {
          return Promise.resolve(true);
        },
      );

    expect(
      await fileService.deleteFile(documents[0].userId, 'myfile.pdf'),
    ).toBe(true);
    expect(storage.deleteFile).toHaveBeenCalledTimes(1);
  });
});
