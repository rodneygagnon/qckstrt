# QCKSTRT Backend

NestJS microservices with GraphQL Federation and pluggable provider architecture.

## Documentation

See the main documentation for detailed information:

- **[Getting Started](../../docs/guides/getting-started.md)** - Setup and development
- **[System Overview](../../docs/architecture/system-overview.md)** - Architecture details
- **[Provider Pattern](../../docs/architecture/provider-pattern.md)** - How providers work
- **[AI/ML Pipeline](../../docs/architecture/ai-ml-pipeline.md)** - RAG implementation

## Quick Start

```bash
# Install dependencies
npm install

# Start all microservices
npm run start:dev

# Start specific service
npm run start:dev -- api        # API Gateway
npm run start:dev -- knowledge  # Knowledge/RAG service

# Build
npm run build

# Test
npm run test
```

## Microservices

| Service | Port | Purpose |
|---------|------|---------|
| API Gateway | 3000 | GraphQL Federation gateway |
| Users | 3001 | User management |
| Documents | 3002 | Document storage |
| Knowledge | 3003 | RAG/semantic search |
| Files | 3004 | File processing |

## Configuration

Edit `.env` file for local development:

```bash
# Embeddings
EMBEDDINGS_PROVIDER=xenova

# Vector Database
VECTOR_DB_PROVIDER=chromadb
VECTOR_DB_CHROMA_URL=http://localhost:8000

# LLM
LLM_URL=http://localhost:11434
LLM_MODEL=falcon

# Relational Database (auto-detected)
NODE_ENV=development  # Uses SQLite
```

See [Getting Started Guide](../../docs/guides/getting-started.md) for more details.
