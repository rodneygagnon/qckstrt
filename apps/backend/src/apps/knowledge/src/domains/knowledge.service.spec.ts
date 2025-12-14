/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';

import { KnowledgeService } from './knowledge.service';
import { EmbeddingsService } from '@qckstrt/embeddings-provider';
import { IVectorDBProvider, IVectorDocument } from '@qckstrt/vectordb-provider';
import { ILLMProvider, GenerateResult } from '@qckstrt/llm-provider';

describe('KnowledgeService', () => {
  let knowledgeService: KnowledgeService;
  let embeddingsService: EmbeddingsService;
  let vectorDB: IVectorDBProvider;
  let llm: ILLMProvider;

  const mockEmbeddings = [[0.1, 0.2, 0.3]];
  const mockTexts = ['chunk 1', 'chunk 2'];
  const mockQueryEmbedding = [0.1, 0.2, 0.3];

  beforeEach(async () => {
    const mockVectorDB: Partial<IVectorDBProvider> = {
      getName: jest.fn().mockReturnValue('MockVectorDB'),
      createEmbeddings: jest.fn().mockResolvedValue(undefined),
      queryEmbeddings: jest.fn().mockResolvedValue([]),
      deleteEmbeddingsByDocumentId: jest.fn().mockResolvedValue(undefined),
    };

    const mockLLM: Partial<ILLMProvider> = {
      getName: jest.fn().mockReturnValue('MockLLM'),
      getModelName: jest.fn().mockReturnValue('mock-model'),
      generate: jest.fn().mockResolvedValue({
        text: 'Generated answer',
        tokensUsed: 100,
      } as GenerateResult),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KnowledgeService,
        {
          provide: EmbeddingsService,
          useValue: createMock<EmbeddingsService>(),
        },
        {
          provide: 'VECTOR_DB_PROVIDER',
          useValue: mockVectorDB,
        },
        {
          provide: 'LLM_PROVIDER',
          useValue: mockLLM,
        },
      ],
    }).compile();

    knowledgeService = module.get<KnowledgeService>(KnowledgeService);
    embeddingsService = module.get<EmbeddingsService>(EmbeddingsService);
    vectorDB = module.get<IVectorDBProvider>('VECTOR_DB_PROVIDER');
    llm = module.get<ILLMProvider>('LLM_PROVIDER');
  });

  it('services should be defined', () => {
    expect(knowledgeService).toBeDefined();
    expect(embeddingsService).toBeDefined();
    expect(vectorDB).toBeDefined();
    expect(llm).toBeDefined();
  });

  describe('indexDocument', () => {
    it('should index a document successfully', async () => {
      embeddingsService.getEmbeddingsForText = jest.fn().mockResolvedValue({
        embeddings: mockEmbeddings,
        texts: mockTexts,
      });

      await knowledgeService.indexDocument('user-1', 'doc-1', 'Test content');

      expect(embeddingsService.getEmbeddingsForText).toHaveBeenCalledWith(
        'Test content',
      );
      expect(vectorDB.createEmbeddings).toHaveBeenCalledWith(
        'user-1',
        'doc-1',
        mockEmbeddings,
        mockTexts,
      );
    });

    it('should throw error when indexing fails', async () => {
      embeddingsService.getEmbeddingsForText = jest
        .fn()
        .mockRejectedValue(new Error('Embedding failed'));

      await expect(
        knowledgeService.indexDocument('user-1', 'doc-1', 'Test content'),
      ).rejects.toThrow('Embedding failed');
    });
  });

  describe('answerQuery', () => {
    it('should answer a query using RAG', async () => {
      const mockResults: IVectorDocument[] = [
        {
          id: '1',
          content: 'Context chunk 1',
          embedding: [],
          metadata: { source: 'doc-1', userId: 'user-1' },
        },
        {
          id: '2',
          content: 'Context chunk 2',
          embedding: [],
          metadata: { source: 'doc-1', userId: 'user-1' },
        },
      ];

      embeddingsService.getEmbeddingsForQuery = jest
        .fn()
        .mockResolvedValue(mockQueryEmbedding);
      vectorDB.queryEmbeddings = jest.fn().mockResolvedValue(mockResults);
      llm.generate = jest.fn().mockResolvedValue({
        text: 'This is the answer based on context.',
        tokensUsed: 50,
      });

      const answer = await knowledgeService.answerQuery(
        'user-1',
        'What is the topic?',
      );

      expect(embeddingsService.getEmbeddingsForQuery).toHaveBeenCalledWith(
        'What is the topic?',
      );
      expect(vectorDB.queryEmbeddings).toHaveBeenCalledWith(
        mockQueryEmbedding,
        'user-1',
        3,
      );
      expect(llm.generate).toHaveBeenCalled();
      expect(answer).toBe('This is the answer based on context.');
    });

    it('should return no-info message when no context is found', async () => {
      embeddingsService.getEmbeddingsForQuery = jest
        .fn()
        .mockResolvedValue(mockQueryEmbedding);
      vectorDB.queryEmbeddings = jest.fn().mockResolvedValue([]);

      const answer = await knowledgeService.answerQuery(
        'user-1',
        'Unknown topic?',
      );

      expect(answer).toBe(
        'I could not find any relevant information to answer your question.',
      );
      expect(llm.generate).not.toHaveBeenCalled();
    });

    it('should return no-info message when semantic search fails', async () => {
      // semanticSearch catches errors and returns empty array
      embeddingsService.getEmbeddingsForQuery = jest
        .fn()
        .mockRejectedValue(new Error('Query embedding failed'));

      const answer = await knowledgeService.answerQuery('user-1', 'Test query');

      expect(answer).toBe(
        'I could not find any relevant information to answer your question.',
      );
      expect(llm.generate).not.toHaveBeenCalled();
    });
  });

  describe('searchText', () => {
    it('should search for relevant text chunks', async () => {
      const mockResults: IVectorDocument[] = [
        {
          id: '1',
          content: 'Result 1',
          embedding: [],
          metadata: { source: 'doc-1', userId: 'user-1' },
        },
        {
          id: '2',
          content: 'Result 2',
          embedding: [],
          metadata: { source: 'doc-2', userId: 'user-1' },
        },
      ];

      embeddingsService.getEmbeddingsForQuery = jest
        .fn()
        .mockResolvedValue(mockQueryEmbedding);
      vectorDB.queryEmbeddings = jest.fn().mockResolvedValue(mockResults);

      const results = await knowledgeService.searchText(
        'user-1',
        'search term',
        5,
      );

      expect(results).toEqual(['Result 1', 'Result 2']);
      expect(vectorDB.queryEmbeddings).toHaveBeenCalledWith(
        mockQueryEmbedding,
        'user-1',
        5,
      );
    });

    it('should return empty array when search fails', async () => {
      embeddingsService.getEmbeddingsForQuery = jest
        .fn()
        .mockRejectedValue(new Error('Search failed'));

      const results = await knowledgeService.searchText(
        'user-1',
        'search term',
      );

      expect(results).toEqual([]);
    });

    it('should use default count of 3', async () => {
      embeddingsService.getEmbeddingsForQuery = jest
        .fn()
        .mockResolvedValue(mockQueryEmbedding);
      vectorDB.queryEmbeddings = jest.fn().mockResolvedValue([]);

      await knowledgeService.searchText('user-1', 'search term');

      expect(vectorDB.queryEmbeddings).toHaveBeenCalledWith(
        mockQueryEmbedding,
        'user-1',
        3,
      );
    });
  });

  describe('deleteDocumentEmbeddings', () => {
    it('should delete document embeddings', async () => {
      await knowledgeService.deleteDocumentEmbeddings('user-1', 'doc-1');

      expect(vectorDB.deleteEmbeddingsByDocumentId).toHaveBeenCalledWith(
        'doc-1',
      );
    });

    it('should throw error when deletion fails', async () => {
      vectorDB.deleteEmbeddingsByDocumentId = jest
        .fn()
        .mockRejectedValue(new Error('Deletion failed'));

      await expect(
        knowledgeService.deleteDocumentEmbeddings('user-1', 'doc-1'),
      ).rejects.toThrow('Deletion failed');
    });
  });
});
