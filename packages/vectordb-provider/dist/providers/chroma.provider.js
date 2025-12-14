"use strict";
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
var ChromaDBProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChromaDBProvider = void 0;
const common_1 = require("@nestjs/common");
const chromadb_1 = require("chromadb");
const common_2 = require("@qckstrt/common");
/**
 * ChromaDB Vector Database Provider (OSS)
 *
 * Uses ChromaDB for vector storage and similarity search.
 * ChromaDB is a Python-based vector database optimized for embeddings.
 *
 * Setup:
 * 1. Install ChromaDB: pip install chromadb
 * 2. Run server: chroma run --path ./chroma_data
 * 3. Default endpoint: http://localhost:8000
 *
 * Pros:
 * - Easy to set up and use
 * - Good for development and small-medium scale
 * - Built-in persistence
 *
 * Cons:
 * - Python-based (requires separate service)
 * - Not as fast as Qdrant for large scale
 * - Limited production features
 */
let ChromaDBProvider = (ChromaDBProvider_1 = class ChromaDBProvider {
  chromaUrl;
  collectionName;
  logger = new common_1.Logger(ChromaDBProvider_1.name);
  client;
  collection = null;
  dimensions;
  constructor(chromaUrl, collectionName, dimensions = 384) {
    this.chromaUrl = chromaUrl;
    this.collectionName = collectionName;
    this.client = new chromadb_1.ChromaClient({ path: chromaUrl });
    this.dimensions = dimensions;
    this.logger.log(
      `ChromaDB provider initialized with URL: ${chromaUrl}, collection: ${collectionName}`,
    );
  }
  getName() {
    return "ChromaDB";
  }
  getDimensions() {
    return this.dimensions;
  }
  async initialize() {
    try {
      this.logger.log(
        `Initializing ChromaDB collection: ${this.collectionName}`,
      );
      this.collection = await this.client.getOrCreateCollection({
        name: this.collectionName,
        metadata: { description: "Document embeddings for RAG" },
      });
      this.logger.log(
        `ChromaDB collection "${this.collectionName}" initialized successfully`,
      );
    } catch (error) {
      this.logger.error("Failed to initialize ChromaDB collection:", error);
      throw new common_2.VectorDBError(this.getName(), "initialize", error);
    }
  }
  async createEmbeddings(userId, documentId, embeddings, content) {
    if (!this.collection) {
      throw new common_2.VectorDBError(
        this.getName(),
        "createEmbeddings",
        new Error("ChromaDB collection not initialized"),
      );
    }
    try {
      this.logger.log(
        `Creating ${embeddings.length} embeddings for document ${documentId}`,
      );
      // Prepare documents for batch insertion
      const ids = [];
      const documents = [];
      const metadatas = [];
      const embeddingVectors = [];
      embeddings.forEach((embedding, idx) => {
        // Generate unique ID for each chunk: documentId-chunkIndex
        ids.push(`${documentId}-${idx}`);
        documents.push(content[idx]);
        metadatas.push({ source: documentId, userId });
        embeddingVectors.push(embedding);
      });
      // Add documents in batches (ChromaDB handles large batches well)
      const chunkSize = 500;
      for (let i = 0; i < ids.length; i += chunkSize) {
        const endIdx = Math.min(i + chunkSize, ids.length);
        const chunk = {
          ids: ids.slice(i, endIdx),
          embeddings: embeddingVectors.slice(i, endIdx),
          metadatas: metadatas.slice(i, endIdx),
          documents: documents.slice(i, endIdx),
        };
        this.logger.log(
          `Adding chunk ${i / chunkSize + 1}: ${chunk.ids.length} documents`,
        );
        await this.collection.add(chunk);
      }
      this.logger.log(
        `Successfully added ${ids.length} embeddings for document ${documentId}`,
      );
      return true;
    } catch (error) {
      this.logger.error("Error creating embeddings in ChromaDB:", error);
      throw new common_2.VectorDBError(
        this.getName(),
        "createEmbeddings",
        error,
      );
    }
  }
  async queryEmbeddings(queryEmbedding, userId, nResults = 5) {
    if (!this.collection) {
      throw new common_2.VectorDBError(
        this.getName(),
        "queryEmbeddings",
        new Error("ChromaDB collection not initialized"),
      );
    }
    try {
      this.logger.log(`Querying ChromaDB for top ${nResults} results`);
      const results = await this.collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults,
        where: { userId }, // Filter by user
      });
      // Transform results into IVectorDocument format
      const documents = [];
      if (
        results.ids &&
        results.ids[0] &&
        results.embeddings &&
        results.embeddings[0] &&
        results.metadatas &&
        results.metadatas[0] &&
        results.documents &&
        results.documents[0]
      ) {
        for (let i = 0; i < results.ids[0].length; i++) {
          const embedding = results.embeddings[0][i];
          if (embedding) {
            documents.push({
              id: results.ids[0][i],
              embedding,
              metadata: results.metadatas[0][i],
              content: results.documents[0][i],
            });
          }
        }
      }
      this.logger.log(`Found ${documents.length} matching documents`);
      return documents;
    } catch (error) {
      this.logger.error("Error querying embeddings from ChromaDB:", error);
      throw new common_2.VectorDBError(
        this.getName(),
        "queryEmbeddings",
        error,
      );
    }
  }
  async deleteEmbeddingsByDocumentId(documentId) {
    if (!this.collection) {
      throw new common_2.VectorDBError(
        this.getName(),
        "deleteEmbeddingsByDocumentId",
        new Error("ChromaDB collection not initialized"),
      );
    }
    try {
      this.logger.log(`Deleting embeddings for document ${documentId}`);
      // Delete all chunks for a given document (source metadata)
      await this.collection.delete({
        where: { source: documentId },
      });
      this.logger.log(`Deleted embeddings for document ${documentId}`);
    } catch (error) {
      this.logger.error("Error deleting embeddings from ChromaDB:", error);
      throw new common_2.VectorDBError(
        this.getName(),
        "deleteEmbeddingsByDocumentId",
        error,
      );
    }
  }
  async deleteEmbeddingById(id) {
    if (!this.collection) {
      throw new common_2.VectorDBError(
        this.getName(),
        "deleteEmbeddingById",
        new Error("ChromaDB collection not initialized"),
      );
    }
    try {
      this.logger.log(`Deleting embedding ${id}`);
      await this.collection.delete({ ids: [id] });
      this.logger.log(`Deleted embedding ${id}`);
    } catch (error) {
      this.logger.error("Error deleting embedding from ChromaDB:", error);
      throw new common_2.VectorDBError(
        this.getName(),
        "deleteEmbeddingById",
        error,
      );
    }
  }
});
exports.ChromaDBProvider = ChromaDBProvider;
exports.ChromaDBProvider =
  ChromaDBProvider =
  ChromaDBProvider_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata("design:paramtypes", [String, String, Number]),
      ],
      ChromaDBProvider,
    );
//# sourceMappingURL=chroma.provider.js.map
