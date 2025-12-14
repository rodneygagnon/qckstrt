/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';

import { KnowledgeResolver } from './knowledge.resolver';
import { KnowledgeService } from './knowledge.service';

describe('KnowledgeResolver', () => {
  let knowledgeResolver: KnowledgeResolver;
  let knowledgeService: KnowledgeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KnowledgeResolver,
        {
          provide: KnowledgeService,
          useValue: createMock<KnowledgeService>(),
        },
      ],
    }).compile();

    knowledgeResolver = module.get<KnowledgeResolver>(KnowledgeResolver);
    knowledgeService = module.get<KnowledgeService>(KnowledgeService);
  });

  it('resolver and services should be defined', () => {
    expect(knowledgeResolver).toBeDefined();
    expect(knowledgeService).toBeDefined();
  });

  describe('answerQuery', () => {
    it('should return answer from knowledge service', async () => {
      const mockAnswer = 'This is the answer to your question.';
      knowledgeService.answerQuery = jest.fn().mockResolvedValue(mockAnswer);

      const result = await knowledgeResolver.answerQuery(
        'user-1',
        'What is the topic?',
      );

      expect(result).toBe(mockAnswer);
      expect(knowledgeService.answerQuery).toHaveBeenCalledWith(
        'user-1',
        'What is the topic?',
      );
    });

    it('should propagate errors from service', async () => {
      knowledgeService.answerQuery = jest
        .fn()
        .mockRejectedValue(new Error('Query failed'));

      await expect(
        knowledgeResolver.answerQuery('user-1', 'test query'),
      ).rejects.toThrow('Query failed');
    });
  });

  describe('searchText', () => {
    it('should return search results from knowledge service', async () => {
      const mockResults = ['chunk 1', 'chunk 2', 'chunk 3'];
      knowledgeService.searchText = jest.fn().mockResolvedValue(mockResults);

      const result = await knowledgeResolver.searchText(
        'user-1',
        'search term',
        5,
      );

      expect(result).toEqual(mockResults);
      expect(knowledgeService.searchText).toHaveBeenCalledWith(
        'user-1',
        'search term',
        5,
      );
    });

    it('should return empty array when no results found', async () => {
      knowledgeService.searchText = jest.fn().mockResolvedValue([]);

      const result = await knowledgeResolver.searchText(
        'user-1',
        'unknown term',
        3,
      );

      expect(result).toEqual([]);
    });
  });

  describe('indexDocument', () => {
    it('should return true when indexing succeeds', async () => {
      knowledgeService.indexDocument = jest.fn().mockResolvedValue(undefined);

      const result = await knowledgeResolver.indexDocument(
        'user-1',
        'doc-1',
        'Document content',
      );

      expect(result).toBe(true);
      expect(knowledgeService.indexDocument).toHaveBeenCalledWith(
        'user-1',
        'doc-1',
        'Document content',
      );
    });

    it('should return false when indexing fails', async () => {
      knowledgeService.indexDocument = jest
        .fn()
        .mockRejectedValue(new Error('Index failed'));

      const result = await knowledgeResolver.indexDocument(
        'user-1',
        'doc-1',
        'Document content',
      );

      expect(result).toBe(false);
    });
  });
});
