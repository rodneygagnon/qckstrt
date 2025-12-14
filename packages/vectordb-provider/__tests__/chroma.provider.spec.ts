import "reflect-metadata";
import { ChromaDBProvider } from "../src/providers/chroma.provider";
import { VectorDBError } from "@qckstrt/common";

// Mock chromadb
const mockAdd = jest.fn();
const mockQuery = jest.fn();
const mockDelete = jest.fn();
const mockGetOrCreateCollection = jest.fn();

jest.mock("chromadb", () => ({
  ChromaClient: jest.fn().mockImplementation(() => ({
    getOrCreateCollection: mockGetOrCreateCollection,
  })),
}));

// Mock NestJS Logger
jest.mock("@nestjs/common", () => ({
  Injectable: () => (target: any) => target,
  Logger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  })),
}));

describe("ChromaDBProvider", () => {
  let provider: ChromaDBProvider;
  const mockCollection = {
    add: mockAdd,
    query: mockQuery,
    delete: mockDelete,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetOrCreateCollection.mockResolvedValue(mockCollection);
    provider = new ChromaDBProvider(
      "http://localhost:8000",
      "test-collection",
      384,
    );
  });

  describe("constructor", () => {
    it("should initialize with config", () => {
      expect(provider.getName()).toBe("ChromaDB");
      expect(provider.getDimensions()).toBe(384);
    });

    it("should use default dimensions when not provided", () => {
      const defaultProvider = new ChromaDBProvider(
        "http://localhost:8000",
        "test-collection",
      );
      expect(defaultProvider.getDimensions()).toBe(384);
    });
  });

  describe("initialize", () => {
    it("should create or get collection", async () => {
      await provider.initialize();

      expect(mockGetOrCreateCollection).toHaveBeenCalledWith({
        name: "test-collection",
        metadata: { description: "Document embeddings for RAG" },
      });
    });

    it("should throw VectorDBError on failure", async () => {
      mockGetOrCreateCollection.mockRejectedValue(
        new Error("Connection failed"),
      );

      await expect(provider.initialize()).rejects.toThrow(VectorDBError);
    });
  });

  describe("createEmbeddings", () => {
    beforeEach(async () => {
      await provider.initialize();
    });

    it("should add embeddings to collection", async () => {
      mockAdd.mockResolvedValue(undefined);

      const result = await provider.createEmbeddings(
        "user-1",
        "doc-1",
        [
          [0.1, 0.2],
          [0.3, 0.4],
        ],
        ["content 1", "content 2"],
      );

      expect(result).toBe(true);
      expect(mockAdd).toHaveBeenCalledWith({
        ids: ["doc-1-0", "doc-1-1"],
        embeddings: [
          [0.1, 0.2],
          [0.3, 0.4],
        ],
        metadatas: [
          { source: "doc-1", userId: "user-1" },
          { source: "doc-1", userId: "user-1" },
        ],
        documents: ["content 1", "content 2"],
      });
    });

    it("should batch large embeddings", async () => {
      mockAdd.mockResolvedValue(undefined);

      // Create 600 embeddings to test batching (batch size is 500)
      const embeddings = Array(600).fill([0.1, 0.2]);
      const contents = Array(600).fill("content");

      await provider.createEmbeddings("user-1", "doc-1", embeddings, contents);

      // Should be called twice (500 + 100)
      expect(mockAdd).toHaveBeenCalledTimes(2);
    });

    it("should throw VectorDBError when collection not initialized", async () => {
      const uninitializedProvider = new ChromaDBProvider(
        "http://localhost:8000",
        "test-collection",
      );

      await expect(
        uninitializedProvider.createEmbeddings(
          "user-1",
          "doc-1",
          [[0.1]],
          ["content"],
        ),
      ).rejects.toThrow(VectorDBError);
    });

    it("should throw VectorDBError on add failure", async () => {
      mockAdd.mockRejectedValue(new Error("Add failed"));

      await expect(
        provider.createEmbeddings("user-1", "doc-1", [[0.1]], ["content"]),
      ).rejects.toThrow(VectorDBError);
    });
  });

  describe("queryEmbeddings", () => {
    beforeEach(async () => {
      await provider.initialize();
    });

    it("should query collection and return documents", async () => {
      mockQuery.mockResolvedValue({
        ids: [["id-1", "id-2"]],
        embeddings: [
          [
            [0.1, 0.2],
            [0.3, 0.4],
          ],
        ],
        metadatas: [
          [
            { source: "doc-1", userId: "user-1" },
            { source: "doc-2", userId: "user-1" },
          ],
        ],
        documents: [["content 1", "content 2"]],
      });

      const results = await provider.queryEmbeddings([0.1, 0.2], "user-1", 5);

      expect(mockQuery).toHaveBeenCalledWith({
        queryEmbeddings: [[0.1, 0.2]],
        nResults: 5,
        where: { userId: "user-1" },
      });
      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        id: "id-1",
        embedding: [0.1, 0.2],
        metadata: { source: "doc-1", userId: "user-1" },
        content: "content 1",
      });
    });

    it("should return empty array when no results", async () => {
      mockQuery.mockResolvedValue({
        ids: [[]],
        embeddings: [[]],
        metadatas: [[]],
        documents: [[]],
      });

      const results = await provider.queryEmbeddings([0.1], "user-1", 5);

      expect(results).toEqual([]);
    });

    it("should throw VectorDBError when collection not initialized", async () => {
      const uninitializedProvider = new ChromaDBProvider(
        "http://localhost:8000",
        "test-collection",
      );

      await expect(
        uninitializedProvider.queryEmbeddings([0.1], "user-1", 5),
      ).rejects.toThrow(VectorDBError);
    });

    it("should throw VectorDBError on query failure", async () => {
      mockQuery.mockRejectedValue(new Error("Query failed"));

      await expect(
        provider.queryEmbeddings([0.1], "user-1", 5),
      ).rejects.toThrow(VectorDBError);
    });
  });

  describe("deleteEmbeddingsByDocumentId", () => {
    beforeEach(async () => {
      await provider.initialize();
    });

    it("should delete embeddings by document source", async () => {
      mockDelete.mockResolvedValue(undefined);

      await provider.deleteEmbeddingsByDocumentId("doc-1");

      expect(mockDelete).toHaveBeenCalledWith({
        where: { source: "doc-1" },
      });
    });

    it("should throw VectorDBError when collection not initialized", async () => {
      const uninitializedProvider = new ChromaDBProvider(
        "http://localhost:8000",
        "test-collection",
      );

      await expect(
        uninitializedProvider.deleteEmbeddingsByDocumentId("doc-1"),
      ).rejects.toThrow(VectorDBError);
    });

    it("should throw VectorDBError on delete failure", async () => {
      mockDelete.mockRejectedValue(new Error("Delete failed"));

      await expect(
        provider.deleteEmbeddingsByDocumentId("doc-1"),
      ).rejects.toThrow(VectorDBError);
    });
  });

  describe("deleteEmbeddingById", () => {
    beforeEach(async () => {
      await provider.initialize();
    });

    it("should delete embedding by id", async () => {
      mockDelete.mockResolvedValue(undefined);

      await provider.deleteEmbeddingById("doc-1-0");

      expect(mockDelete).toHaveBeenCalledWith({
        ids: ["doc-1-0"],
      });
    });

    it("should throw VectorDBError when collection not initialized", async () => {
      const uninitializedProvider = new ChromaDBProvider(
        "http://localhost:8000",
        "test-collection",
      );

      await expect(
        uninitializedProvider.deleteEmbeddingById("doc-1-0"),
      ).rejects.toThrow(VectorDBError);
    });

    it("should throw VectorDBError on delete failure", async () => {
      mockDelete.mockRejectedValue(new Error("Delete failed"));

      await expect(provider.deleteEmbeddingById("doc-1-0")).rejects.toThrow(
        VectorDBError,
      );
    });
  });
});
