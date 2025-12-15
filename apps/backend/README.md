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
pnpm install

# Start all microservices
pnpm start

# Start specific service
pnpm start:api        # API Gateway
pnpm start:knowledge  # Knowledge/RAG service

# Build
pnpm build

# Test
pnpm test
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

# Vector Database (pgvector uses same PostgreSQL instance)
# Falls back to RELATIONAL_DB_* if not specified
VECTOR_DB_DIMENSIONS=384

# LLM
LLM_URL=http://localhost:11434
LLM_MODEL=falcon

# Relational Database (PostgreSQL via Supabase)
RELATIONAL_DB_PROVIDER=postgres
RELATIONAL_DB_HOST=localhost
RELATIONAL_DB_PORT=5432
RELATIONAL_DB_DATABASE=postgres
RELATIONAL_DB_USERNAME=postgres
RELATIONAL_DB_PASSWORD=your-super-secret-password
```

See [Getting Started Guide](../../docs/guides/getting-started.md) for more details.
