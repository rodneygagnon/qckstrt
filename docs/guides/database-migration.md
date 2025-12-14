# Database Migration Guide

This guide covers migrating between different database providers.

## Common Migrations

1. [SQLite → PostgreSQL](#sqlite--postgresql) (Dev → Prod)
2. [ChromaDB → pgvector](#chromadb--pgvector) (Consolidation)
3. [Development → Production](#development--production) (Full Stack)

---

## SQLite → PostgreSQL

**When**: Moving from development to production

**Why**: PostgreSQL is production-ready with better concurrency, backups, and scalability

### Step 1: Set Up PostgreSQL

**Using Docker**:
```bash
docker-compose up -d postgres
```

**Or install locally**:
```bash
# macOS
brew install postgresql@16
brew services start postgresql@16

# Ubuntu/Debian
sudo apt install postgresql-16
sudo systemctl start postgresql

# Create database
createdb qckstrt
```

### Step 2: Export Data from SQLite

```bash
cd apps/backend

# Dump SQLite data to SQL
sqlite3 ./data/dev.sqlite .dump > sqlite-backup.sql

# Or use TypeORM CLI (if configured)
npm run typeorm -- migration:generate -n InitialData
```

### Step 3: Update Configuration

```bash
# apps/backend/.env

# Old (SQLite)
# RELATIONAL_DB_PROVIDER=sqlite
# RELATIONAL_DB_DATABASE=./data/dev.sqlite

# New (PostgreSQL)
RELATIONAL_DB_PROVIDER=postgres
RELATIONAL_DB_HOST=localhost
RELATIONAL_DB_PORT=5432
RELATIONAL_DB_DATABASE=qckstrt
RELATIONAL_DB_USERNAME=qckstrt_user
RELATIONAL_DB_PASSWORD=qckstrt_password
RELATIONAL_DB_SSL=false
```

### Step 4: Import Data to PostgreSQL

**Option A: Let TypeORM sync** (if synchronize=true):
```bash
# Start app - TypeORM will create tables automatically
npm run start:dev
```

**Option B: Manual import**:
```bash
# Import SQLite dump (may need adjustments)
psql -U qckstrt_user -d qckstrt < sqlite-backup.sql

# Or use TypeORM migrations
npm run typeorm -- migration:run
```

### Step 5: Verify

```bash
# Connect to PostgreSQL
psql -U qckstrt_user -d qckstrt

# Check tables
\dt

# Check data
SELECT * FROM users LIMIT 5;
SELECT COUNT(*) FROM documents;
```

### Step 6: Test Application

```bash
# Start application
npm run start:dev

# Test critical flows
# - User login
# - Document upload
# - RAG queries
```

---

## ChromaDB → pgvector

**When**: Consolidating databases in production

**Why**: Single PostgreSQL database for both relational + vector data

**Benefits**:
- Reduced infrastructure complexity
- ACID transactions across relational + vector data
- Cost savings (one database instead of two)
- Familiar PostgreSQL tooling

### Prerequisites

- PostgreSQL 11+ installed
- pgvector extension available

### Step 1: Install pgvector

**Docker** (if using Docker Compose):
```yaml
# docker-compose.yml
postgres:
  image: ankane/pgvector:latest  # Use pgvector-enabled image
  # OR
  image: postgres:16-alpine
  # Then install manually (see below)
```

**Manual installation**:
```bash
# Connect to PostgreSQL
docker exec -it qckstrt-postgres psql -U qckstrt_user -d qckstrt

# Install extension
CREATE EXTENSION IF NOT EXISTS vector;

# Verify
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### Step 2: Export from ChromaDB

**Option A: Via API**:
```typescript
// Export script
import { ChromaClient } from 'chromadb';

const client = new ChromaClient({ path: 'http://localhost:8000' });
const collection = await client.getCollection({ name: 'qckstrt-embeddings' });

const data = await collection.get({
  include: ['embeddings', 'metadatas', 'documents'],
});

// Save to file
fs.writeFileSync('chroma-export.json', JSON.stringify(data, null, 2));
```

**Option B: Direct database access** (ChromaDB uses SQLite):
```bash
# Copy ChromaDB data
docker cp qckstrt-chromadb:/chroma/chroma ./chroma-backup
```

### Step 3: Update Configuration

```bash
# apps/backend/.env

# Old (ChromaDB)
# VECTOR_DB_PROVIDER=chromadb
# VECTOR_DB_CHROMA_URL=http://localhost:8000

# New (pgvector)
VECTOR_DB_PROVIDER=pgvector
VECTOR_DB_DIMENSIONS=384  # Must match your embedding model
# Uses RELATIONAL_DB_* config automatically
```

### Step 4: Initialize pgvector Tables

```bash
# Start app - pgvector provider creates tables automatically
npm run start:dev
```

This creates:
```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE vector_embeddings (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  document_id VARCHAR(255) NOT NULL,
  embedding vector(384) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_embedding_hnsw
  ON vector_embeddings
  USING hnsw (embedding vector_cosine_ops);
```

### Step 5: Import Data to pgvector

**Option A: Re-index documents** (recommended):
```typescript
// Re-index all documents
for (const doc of documents) {
  await knowledgeService.indexDocument(
    doc.userId,
    doc.id,
    doc.content
  );
}
```

**Option B: Import exported data**:
```typescript
// Import script
const exportedData = JSON.parse(fs.readFileSync('chroma-export.json'));

for (let i = 0; i < exportedData.ids.length; i++) {
  await db.query(`
    INSERT INTO vector_embeddings (id, user_id, document_id, embedding, content)
    VALUES ($1, $2, $3, $4, $5)
  `, [
    exportedData.ids[i],
    exportedData.metadatas[i].userId,
    exportedData.metadatas[i].documentId,
    exportedData.embeddings[i],  // pgvector accepts arrays
    exportedData.metadatas[i].content,
  ]);
}
```

### Step 6: Verify

```bash
# Connect to PostgreSQL
psql -U qckstrt_user -d qckstrt

# Check vector extension
\dx vector

# Check table
SELECT COUNT(*) FROM vector_embeddings;

# Test similarity search
SELECT id, content, embedding <=> '[0.1, 0.2, ...]'::vector AS distance
FROM vector_embeddings
ORDER BY embedding <=> '[0.1, 0.2, ...]'::vector
LIMIT 5;
```

### Step 7: Update Docker Compose

Remove ChromaDB service:

```yaml
# docker-compose.yml

# Comment out or remove:
# chromadb:
#   image: chromadb/chroma:latest
#   ...

# Keep only:
services:
  postgres:  # With pgvector
    image: ankane/pgvector:latest
    ...

  ollama:  # LLM server
    image: ollama/ollama:latest
    ...
```

### Step 8: Test Application

```bash
# Restart services
docker-compose down
docker-compose up -d

# Test RAG pipeline
cd apps/backend
npm run start:dev

# Test queries via GraphQL
```

---

## Development → Production

**Full migration** from development stack to production stack.

### Development Stack
```
- Relational DB: SQLite
- Vector DB: ChromaDB
- Embeddings: Xenova
- LLM: Ollama (Falcon 7B)
```

### Production Stack (Recommended)
```
- Relational DB: PostgreSQL (RDS/managed)
- Vector DB: pgvector (same PostgreSQL)
- Embeddings: Xenova (same, in-process)
- LLM: Ollama on GPU instance
```

### Migration Steps

**1. Set up PostgreSQL with pgvector**:
```bash
# AWS RDS
aws rds create-db-instance \
  --db-instance-identifier qckstrt-prod \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 16.1 \
  --allocated-storage 100

# Install pgvector (once connected)
CREATE EXTENSION vector;
```

**2. Update configuration**:
```bash
# Production .env
NODE_ENV=production

RELATIONAL_DB_PROVIDER=postgres
RELATIONAL_DB_HOST=qckstrt-prod.xxxx.rds.amazonaws.com
RELATIONAL_DB_PORT=5432
RELATIONAL_DB_DATABASE=qckstrt
RELATIONAL_DB_USERNAME=admin
RELATIONAL_DB_PASSWORD=<secure-password>
RELATIONAL_DB_SSL=true

VECTOR_DB_PROVIDER=pgvector
VECTOR_DB_DIMENSIONS=384

EMBEDDINGS_PROVIDER=xenova
EMBEDDINGS_XENOVA_MODEL=Xenova/all-MiniLM-L6-v2

LLM_URL=http://ollama-gpu-instance:11434
LLM_MODEL=falcon
```

**3. Migrate data**:
```bash
# Export from dev SQLite
sqlite3 ./data/dev.sqlite .dump > dev-data.sql

# Import to production PostgreSQL
psql -h qckstrt-prod.xxxx.rds.amazonaws.com \
     -U admin \
     -d qckstrt \
     < dev-data.sql
```

**4. Re-index documents** (recommended over exporting vectors):
```typescript
// Re-index ensures embeddings match production configuration
for (const document of documents) {
  await knowledgeService.indexDocument(
    document.userId,
    document.id,
    document.content
  );
}
```

**5. Deploy application**:
```bash
# Build for production
npm run build

# Deploy to ECS/Kubernetes/etc.
# (deployment-specific steps)
```

**6. Verify production**:
- Test user authentication
- Upload test document
- Verify RAG queries work
- Check database connections
- Monitor logs for errors

---

## Rollback Procedures

### Rollback SQLite → PostgreSQL

**Step 1**: Update configuration
```bash
RELATIONAL_DB_PROVIDER=sqlite
RELATIONAL_DB_DATABASE=./data/dev.sqlite
```

**Step 2**: Restore SQLite backup
```bash
cp ./backups/dev-20250101.sqlite ./data/dev.sqlite
```

**Step 3**: Restart application
```bash
npm run start:dev
```

### Rollback ChromaDB → pgvector

**Step 1**: Update configuration
```bash
VECTOR_DB_PROVIDER=chromadb
VECTOR_DB_CHROMA_URL=http://localhost:8000
```

**Step 2**: Restart ChromaDB
```bash
docker-compose up -d chromadb
```

**Step 3**: Restore ChromaDB data
```bash
docker cp ./chroma-backup qckstrt-chromadb:/chroma/chroma
docker-compose restart chromadb
```

**Step 4**: Restart application
```bash
npm run start:dev
```

---

## Best Practices

### 1. Backup Before Migration

```bash
# Backup SQLite
cp ./data/dev.sqlite ./backups/dev-$(date +%Y%m%d).sqlite

# Backup PostgreSQL
pg_dump -U qckstrt_user qckstrt > backup-$(date +%Y%m%d).sql

# Backup ChromaDB
docker cp qckstrt-chromadb:/chroma/chroma ./backups/chroma-$(date +%Y%m%d)
```

### 2. Test in Staging First

Never migrate production directly:
1. Set up staging environment
2. Migrate staging database
3. Test thoroughly
4. Only then migrate production

### 3. Plan Downtime

- Schedule migration during low-traffic periods
- Notify users of maintenance window
- Have rollback plan ready

### 4. Verify Data Integrity

```sql
-- Check record counts match
SELECT 'users' AS table_name, COUNT(*) FROM users
UNION ALL
SELECT 'documents', COUNT(*) FROM documents
UNION ALL
SELECT 'vector_embeddings', COUNT(*) FROM vector_embeddings;
```

### 5. Monitor After Migration

- Watch error logs
- Check query performance
- Monitor database metrics
- Verify user workflows

---

## Troubleshooting

### Migration fails with "relation already exists"

**Cause**: Tables already exist in target database

**Solution**:
```sql
-- Drop existing tables
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS vector_embeddings CASCADE;

-- Then retry migration
```

### Vector dimensions mismatch

**Error**: `ERROR: dimensions for type vector(768) must be at least 1 and at most 16000`

**Cause**: Embedding model changed between ChromaDB and pgvector

**Solution**:
```bash
# Verify embedding model dimensions
EMBEDDINGS_XENOVA_MODEL=Xenova/all-MiniLM-L6-v2  # 384 dimensions

# Update pgvector config
VECTOR_DB_DIMENSIONS=384  # Must match!
```

### Slow queries after migration

**Cause**: Missing indexes in PostgreSQL

**Solution**:
```sql
-- Add indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_documents_user_id ON documents(user_id);

-- For pgvector, ensure HNSW index exists
CREATE INDEX idx_embedding_hnsw
  ON vector_embeddings
  USING hnsw (embedding vector_cosine_ops);
```

---

## Related Documentation

- [Data Layer Architecture](../architecture/data-layer.md) - Database details
- [Provider Pattern](../architecture/provider-pattern.md) - How providers work
- [Docker Setup](docker-setup.md) - Infrastructure configuration
- [Getting Started](getting-started.md) - Initial setup
