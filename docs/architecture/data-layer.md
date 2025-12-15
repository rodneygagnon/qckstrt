# Data Layer Architecture

## Overview

The data layer uses a dual-database architecture optimized for different data types:

1. **Relational Database** - User data, document metadata, application state
2. **Vector Database** - Document embeddings for semantic search

Both layers use the provider pattern for flexibility and can be consolidated in production using pgvector.

## Relational Database Layer

### Purpose
- User profiles and authentication
- Document metadata (filename, upload date, owner, etc.)
- Application state and configuration
- Transactional data

### Provider: PostgreSQL via Supabase (Default)

**When to use**: All environments (development, staging, production)

**Configuration**:
```bash
# Default - PostgreSQL via Supabase
RELATIONAL_DB_PROVIDER=postgres
RELATIONAL_DB_HOST=localhost
RELATIONAL_DB_PORT=5432
RELATIONAL_DB_DATABASE=postgres
RELATIONAL_DB_USERNAME=postgres
RELATIONAL_DB_PASSWORD=your-super-secret-password
```

**Docker Compose**:
```bash
# Start the full Supabase stack
docker-compose up -d
```

This starts PostgreSQL as part of the Supabase stack, along with Auth, Storage, and Vault.

**Pros**:
- ✅ Production-ready from day one
- ✅ ACID compliance
- ✅ Concurrent connections
- ✅ Rich feature set
- ✅ pgvector support (vector + relational)
- ✅ Integrated with Supabase Auth, Storage, Vault

**File Location**: `packages/relationaldb-provider/src/providers/postgres.provider.ts`

---

### Provider: Aurora PostgreSQL (AWS Alternative)

**When to use**: AWS deployments, serverless architecture

**Configuration**:
```bash
RELATIONAL_DB_PROVIDER=aurora
RELATIONAL_DB_SECRET_ARN=arn:aws:secretsmanager:...
RELATIONAL_DB_RESOURCE_ARN=arn:aws:rds:...
RELATIONAL_DB_DATABASE=qckstrt
```

**Pros**:
- ✅ Serverless auto-scaling
- ✅ Pay-per-request pricing
- ✅ Automatic backups
- ✅ Multi-AZ by default
- ✅ pgvector support

**Cons**:
- ❌ AWS-specific
- ❌ Cold start latency
- ❌ Higher cost for constant load

**File Location**: `packages/relationaldb-provider/src/providers/aurora.provider.ts`

---

## Vector Database Layer

### Purpose
- Store document embeddings (384/768-dimensional vectors)
- Perform semantic similarity search
- Support RAG (Retrieval-Augmented Generation)

### Provider: ChromaDB (Development Default)

**When to use**: Development, testing, initial deployments

**Configuration**:
```bash
VECTOR_DB_PROVIDER=chromadb
VECTOR_DB_CHROMA_URL=http://localhost:8001  # Port 8001 (Kong uses 8000)
VECTOR_DB_CHROMA_COLLECTION=qckstrt-embeddings
VECTOR_DB_DIMENSIONS=384  # Must match embedding model
```

**Docker Compose**:
ChromaDB is included in the main docker-compose.yml on port 8001:
```bash
docker-compose up -d
```

**Pros**:
- ✅ Purpose-built for vectors
- ✅ Simple API
- ✅ Fast similarity search
- ✅ Built-in persistence
- ✅ Easy to set up

**Cons**:
- ❌ Separate database to manage
- ❌ Additional infrastructure cost
- ❌ No ACID transactions with relational data

**File Location**: `packages/vectordb-provider/src/providers/chroma.provider.ts`

---

### Provider: pgvector (Production Recommended)

**When to use**: Production (consolidates PostgreSQL + vectors)

**Configuration**:
```bash
VECTOR_DB_PROVIDER=pgvector
VECTOR_DB_DIMENSIONS=384
# Uses existing PostgreSQL connection from RELATIONAL_DB_*
```

**Setup** (PostgreSQL extension):
```sql
-- Install extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify
SELECT * FROM pg_extension WHERE extname = 'vector';
```

**Pros**:
- ✅ Single database (PostgreSQL + vectors)
- ✅ ACID transactions across relational + vector data
- ✅ Reduced infrastructure complexity
- ✅ Cost savings (one database instead of two)
- ✅ Familiar PostgreSQL tooling

**Cons**:
- ❌ Requires PostgreSQL 11+ with pgvector
- ❌ Slightly slower than dedicated vector DBs for large scale
- ❌ More complex setup initially

**File Location**: `packages/vectordb-provider/src/providers/pgvector.provider.ts`

**Migration Path**:
See [Database Migration Guide](../guides/database-migration.md#chromadb-to-pgvector)

---

## Data Models

### Relational Tables (TypeORM Entities)

#### User Entity
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### Document Entity
```typescript
@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  filename: string;

  @Column()
  s3Key: string;

  @Column('text')
  content: string;

  @CreateDateColumn()
  uploadedAt: Date;
}
```

### Vector Records

#### ChromaDB Format
```typescript
{
  ids: ['doc-123-chunk-0', 'doc-123-chunk-1'],
  embeddings: [[0.1, 0.2, ...], [0.3, 0.4, ...]],
  metadatas: [
    { userId: 'user-1', documentId: 'doc-123', content: 'chunk text' },
    { userId: 'user-1', documentId: 'doc-123', content: 'chunk text' }
  ]
}
```

#### pgvector Table
```sql
CREATE TABLE vector_embeddings (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  document_id VARCHAR(255) NOT NULL,
  embedding vector(384) NOT NULL,  -- Dimension matches embedding model
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- HNSW index for fast similarity search
CREATE INDEX idx_embedding_hnsw
  ON vector_embeddings
  USING hnsw (embedding vector_cosine_ops);
```

---

## Embedding Dimensions

Vector databases must match the embedding model's output dimensions:

| Embedding Model | Dimensions | Vector DB Configuration |
|----------------|------------|------------------------|
| Xenova/all-MiniLM-L6-v2 | 384 | `VECTOR_DB_DIMENSIONS=384` |
| Xenova/paraphrase-MiniLM-L3-v2 | 768 | `VECTOR_DB_DIMENSIONS=768` |
| Ollama nomic-embed-text | 768 | `VECTOR_DB_DIMENSIONS=768` |

**Important**: Changing embedding models requires re-indexing all documents!

---

## Database Operations

### Document Indexing Flow

```typescript
// 1. Store document metadata (Relational DB)
const document = await documentRepo.save({
  userId: 'user-1',
  filename: 'report.pdf',
  s3Key: 's3://bucket/report.pdf',
  content: 'Full text...',
});

// 2. Generate embeddings
const { embeddings, texts } = await embeddingsService.getEmbeddingsForText(
  document.content
);

// 3. Store vectors (Vector DB)
await vectorDB.createEmbeddings(
  document.userId,
  document.id,
  embeddings,
  texts
);
```

### Semantic Search Flow

```typescript
// 1. Generate query embedding
const queryEmbedding = await embeddingsService.getEmbeddingsForQuery(
  'What is the status?'
);

// 2. Search similar vectors (Vector DB)
const results = await vectorDB.queryEmbeddings(
  queryEmbedding,
  userId,
  topK: 3
);

// 3. Use results for RAG
const context = results.map(r => r.content).join('\n\n');
const answer = await llm.generate(buildPrompt(context, query));
```

### Document Deletion Flow

```typescript
// 1. Delete from relational DB
await documentRepo.delete(documentId);

// 2. Delete associated vectors
await vectorDB.deleteEmbeddingsByDocumentId(documentId);
```

---

## Performance Considerations

### Relational Database

**Connection Pooling**:
```typescript
{
  type: 'postgres',
  // ... connection details
  extra: {
    max: 10,           // Max connections
    min: 2,            // Min connections
    idleTimeoutMillis: 30000,
  }
}
```

**Indexes**:
```sql
-- User lookups by email
CREATE INDEX idx_users_email ON users(email);

-- Document lookups by user
CREATE INDEX idx_documents_user_id ON documents(user_id);

-- Document lookups by upload date
CREATE INDEX idx_documents_uploaded_at ON documents(uploaded_at DESC);
```

### Vector Database

**ChromaDB**:
- In-memory caching of frequently accessed vectors
- Batch insertions for better performance
- Collection per tenant for isolation

**pgvector**:
- HNSW index for approximate nearest neighbor (ANN) search
- Tune `hnsw.m` and `hnsw.ef_construction` for speed vs accuracy tradeoff
- Partition large tables by user_id

```sql
-- Tune HNSW index
CREATE INDEX idx_embedding_hnsw
  ON vector_embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);  -- Adjust for your workload
```

---

## Backup and Recovery

### PostgreSQL (Supabase)
```bash
# Backup
docker exec qckstrt-postgres pg_dump -U qckstrt_user qckstrt > backup.sql

# Restore
docker exec -i qckstrt-postgres psql -U qckstrt_user qckstrt < backup.sql
```

### ChromaDB
```bash
# Backup (copy volume data)
docker cp qckstrt-chromadb:/chroma/chroma ./backups/chroma-$(date +%Y%m%d)

# Restore
docker cp ./backups/chroma-20250101 qckstrt-chromadb:/chroma/chroma
```

### pgvector
```bash
# Included in PostgreSQL backup (pg_dump includes extensions and data)
docker exec qckstrt-postgres pg_dump -U qckstrt_user qckstrt > backup.sql
```

---

## Migration Paths

### Default Stack (Supabase + ChromaDB)
```
All Environments:
  PostgreSQL (via Supabase) + ChromaDB
```

### Consolidated (pgvector)
```
All Environments:
  PostgreSQL with pgvector (single database for relational + vectors)
```

### ChromaDB → pgvector

See detailed guide: [Database Migration](../guides/database-migration.md#chromadb-to-pgvector)

---

## Monitoring

### Relational Database Metrics
- Connection pool utilization
- Query performance (slow query log)
- Table sizes and growth rate
- Index usage statistics

### Vector Database Metrics
- Embedding storage size
- Query latency (p50, p95, p99)
- Number of vectors per collection
- Index build time

### Health Checks
```typescript
// Relational DB
const isHealthy = await dbProvider.isAvailable();

// Vector DB
const isHealthy = await vectorDB.isAvailable();
```

---

**Related Documentation**:
- [Provider Pattern](provider-pattern.md) - Architecture details
- [Database Migration Guide](../guides/database-migration.md) - Switching providers
- [Getting Started](../guides/getting-started.md) - Setup instructions
