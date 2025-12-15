# System Overview

## Architecture Principles

QCKSTRT is built on a modular, provider-based architecture with three core principles:

1. **100% Open Source** - All dependencies use permissive OSS licenses
2. **Self-Hosted First** - Designed for complete data control and privacy
3. **Pluggable Providers** - Swap implementations via configuration, not code

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React/Vite)                    │
└─────────────────────────────────────────────────────────────┘
                            ↓ GraphQL
┌─────────────────────────────────────────────────────────────┐
│              API Gateway (GraphQL Federation)               │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌──────────────┬─────────────┬──────────────┐
        ↓              ↓             ↓
   ┌────────┐    ┌──────────┐  ┌──────────┐
   │ Users  │    │Documents │  │Knowledge │
   │Service │    │ Service  │  │ Service  │
   └────────┘    └──────────┘  └──────────┘
        │              │             │
        ↓              ↓             ↓
   ┌────────────────────────────────────────────────────┐
   │              Provider Layer (Pluggable)            │
   ├────────────────────────────────────────────────────┤
   │ Relational DB │ Vector DB │ Embeddings │   LLM    │
   │  (Supabase)   │ (Chroma)  │  (Xenova)  │ (Ollama) │
   └────────────────────────────────────────────────────┘
```

## Microservices Architecture

### API Gateway
- **Technology**: Apollo Gateway (GraphQL Federation)
- **Port**: 3000
- **Purpose**: Unified GraphQL endpoint for frontend
- **Location**: `apps/backend/src/apps/api`

### Users Service
- **Technology**: NestJS + Apollo Federation
- **Port**: 3001
- **Purpose**: User authentication and management
- **Location**: `apps/backend/src/apps/users`
- **Database**: Relational (User profiles, credentials)

### Documents Service
- **Technology**: NestJS + Apollo Federation
- **Port**: 3002
- **Purpose**: Document storage, metadata management, and file processing
- **Location**: `apps/backend/src/apps/documents`
- **Database**: Relational (Document metadata)
- **Storage**: Supabase Storage

### Knowledge Service
- **Technology**: NestJS + Apollo Federation
- **Port**: 3003
- **Purpose**: RAG (Retrieval-Augmented Generation) system
- **Location**: `apps/backend/src/apps/knowledge`
- **Components**:
  - Embeddings generation (Xenova/Ollama)
  - Vector search (ChromaDB/pgvector)
  - LLM inference (Ollama with Falcon 7B)

## Provider Architecture

All external dependencies use the **Strategy Pattern + Dependency Injection** for maximum flexibility. Providers are implemented as reusable npm packages in the `packages/` directory.

### Platform Packages

| Package | Purpose | Provider Token |
|---------|---------|----------------|
| `@qckstrt/relationaldb-provider` | Database connections | `RELATIONAL_DB_PROVIDER` |
| `@qckstrt/vectordb-provider` | Vector storage & search | `VECTOR_DB_PROVIDER` |
| `@qckstrt/embeddings-provider` | Text embeddings | `EMBEDDINGS_PROVIDER` |
| `@qckstrt/llm-provider` | LLM inference | `LLM_PROVIDER` |
| `@qckstrt/storage-provider` | File storage (Supabase) | `STORAGE_PROVIDER` |
| `@qckstrt/auth-provider` | Authentication (Supabase) | `AUTH_PROVIDER` |
| `@qckstrt/secrets-provider` | Secrets management (Supabase Vault) | `SECRETS_PROVIDER` |
| `@qckstrt/extraction-provider` | Text extraction | `EXTRACTION_PROVIDER` |

### Relational Database Provider
**Package**: `@qckstrt/relationaldb-provider`

```typescript
interface IRelationalDBProvider {
  getName(): string;
  getType(): RelationalDBType;
  getConnectionOptions(entities): DataSourceOptions;
  isAvailable(): Promise<boolean>;
}
```

**Implementations**:
- `PostgresProvider` - Default (via Supabase)

**See**: [Data Layer Architecture](data-layer.md)

### Vector Database Provider
**Package**: `@qckstrt/vectordb-provider`

```typescript
interface IVectorDBProvider {
  initialize(): Promise<void>;
  createEmbeddings(...): Promise<boolean>;
  queryEmbeddings(...): Promise<IVectorDocument[]>;
  deleteEmbeddings...(): Promise<void>;
  getName(): string;
  getDimensions(): number;
}
```

**Implementations**:
- `ChromaDBProvider` - Dedicated vector DB (default)

**See**: [Data Layer Architecture](data-layer.md)

### Embeddings Provider
**Package**: `@qckstrt/embeddings-provider`

```typescript
interface IEmbeddingProvider {
  embedDocuments(texts: string[]): Promise<number[][]>;
  embedQuery(text: string): Promise<number[]>;
  getDimensions(): number;
  getName(): string;
}
```

**Implementations**:
- `XenovaEmbeddingProvider` - In-process, zero-setup (default)
- `OllamaEmbeddingProvider` - Local server, GPU-accelerated

**See**: [AI/ML Pipeline](ai-ml-pipeline.md)

### LLM Provider
**Package**: `@qckstrt/llm-provider`

```typescript
interface ILLMProvider {
  getName(): string;
  getModelName(): string;
  generate(prompt, options): Promise<GenerateResult>;
  generateStream(prompt, options): AsyncGenerator<string>;
  chat(messages, options): Promise<GenerateResult>;
  isAvailable(): Promise<boolean>;
}
```

**Implementation**:
- `OllamaLLMProvider` - Self-hosted, any model (Falcon 7B default)

**See**: [AI/ML Pipeline](ai-ml-pipeline.md)

## Data Flow

### Document Indexing Flow
```
1. User uploads document → Documents Service
2. Documents Service stores metadata → Relational DB
3. Documents Service triggers indexing → Knowledge Service
4. Knowledge Service:
   a. Chunks document text
   b. Generates embeddings (Xenova)
   c. Stores vectors (ChromaDB)
```

### RAG Query Flow
```
1. User asks question → Knowledge Service
2. Knowledge Service:
   a. Generates query embedding (Xenova)
   b. Searches similar vectors (ChromaDB)
   c. Retrieves top-k document chunks
   d. Builds prompt with context
   e. Generates answer (Ollama/Falcon)
3. Returns answer to user
```

**See**: [RAG Implementation Guide](../guides/rag-implementation.md)

## Configuration Management

### Environment-Based Configuration
All services use environment variables with sensible defaults:

```bash
# Default (Supabase OSS stack)
RELATIONAL_DB_PROVIDER=postgres
VECTOR_DB_PROVIDER=chromadb
EMBEDDINGS_PROVIDER=xenova
LLM_MODEL=falcon
AUTH_PROVIDER=supabase
STORAGE_PROVIDER=supabase
SECRETS_PROVIDER=supabase
```

### Configuration Files
- `apps/backend/.env` - Local development overrides
- `apps/backend/src/config/index.ts` - Configuration loader
- `docker-compose.yml` - Service orchestration

**See**: [Getting Started Guide](../guides/getting-started.md)

## Deployment Architecture

### Development
```
Local Machine
├── Node.js (Backend services)
├── Docker Compose (docker-compose up)
│   ├── Supabase (Auth, Storage, Vault, PostgreSQL)
│   ├── ChromaDB (port 8001)
│   └── Ollama (port 11434)
└── Vite Dev Server (Frontend)
```

### Production
```
AWS/Cloud Infrastructure
├── ECS/Kubernetes (Backend services)
├── RDS PostgreSQL (Relational + Vectors via pgvector)
├── EC2 GPU Instance (Ollama)
└── CloudFront + S3 (Frontend)
```

## Technology Stack Summary

| Component | Technology | Version | License |
|-----------|-----------|---------|---------|
| **Backend Framework** | NestJS | 11.x | MIT |
| **API Layer** | GraphQL (Apollo Federation) | 5.x | MIT |
| **Frontend** | React + Vite | 18.x | MIT |
| **Relational DB** | PostgreSQL (via Supabase) | 15.x | PostgreSQL |
| **Auth/Storage/Secrets** | Supabase | Latest | Apache 2.0 |
| **Vector DB** | ChromaDB | Latest | Apache 2.0 |
| **Embeddings** | Xenova/Transformers.js | Latest | Apache 2.0 |
| **LLM Runtime** | Ollama | Latest | MIT |
| **LLM Model** | Falcon 7B | Latest | Apache 2.0 |

## Security Considerations

### Data Privacy
- All AI/ML processing happens on self-hosted infrastructure
- No data sent to third-party APIs (OpenAI, Anthropic, etc.)
- Vector embeddings stored locally
- LLM inference runs locally

### Authentication
- User authentication via Supabase Auth
- Service-to-service auth via API keys
- GraphQL field-level authorization

### Infrastructure
- Self-hosted Supabase stack
- Encryption at rest (PostgreSQL, Supabase Storage)
- Encryption in transit (TLS/HTTPS)
- Secrets management via Supabase Vault

## Monitoring & Observability

### Logging
- Structured logging via NestJS Logger
- Log levels: debug, log, warn, error
- Per-service log streams

### Metrics
- Service health checks
- Database connection pooling metrics
- Vector DB query performance
- LLM inference latency

## Scalability

### Horizontal Scaling
- Stateless services can scale horizontally
- Load balancer for API Gateway
- Read replicas for PostgreSQL

### Vertical Scaling
- Ollama benefits from GPU instances
- ChromaDB can use larger instances
- PostgreSQL can scale vertically

### Database Consolidation
- Future: Migrate to pgvector to consolidate PostgreSQL + ChromaDB
- Reduces infrastructure complexity
- Single database for relational + vector data

**See**: [Database Migration Guide](../guides/database-migration.md)

## Future Enhancements

### Planned Providers
- **Vector DB**: Qdrant, Weaviate, Milvus
- **LLM**: vLLM, Text Generation Inference
- **Embeddings**: Custom fine-tuned models

### Planned Features
- Multi-modal RAG (images, PDFs)
- Streaming RAG responses
- Conversation history
- Fine-tuning support

---

**Next Steps**:
- Review [Provider Pattern](provider-pattern.md) for architecture details
- Read [Getting Started Guide](../guides/getting-started.md) to run the system
- Explore [AI/ML Pipeline](ai-ml-pipeline.md) for RAG implementation
