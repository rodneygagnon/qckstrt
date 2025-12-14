# Provider Pattern Architecture

## Overview

QCKSTRT uses the **Strategy Pattern + Dependency Injection** to create a pluggable provider architecture. This allows swapping implementations (SQLite ↔ PostgreSQL, ChromaDB ↔ pgvector, etc.) via configuration without code changes.

## Design Pattern

### Strategy Pattern
Each provider layer defines an interface that multiple implementations can satisfy:

```typescript
// Interface defines the contract
interface IRelationalDBProvider {
  getName(): string;
  getConnectionOptions(entities): DataSourceOptions;
  isAvailable(): Promise<boolean>;
}

// Multiple implementations
class SQLiteProvider implements IRelationalDBProvider { ... }
class PostgresProvider implements IRelationalDBProvider { ... }
class AuroraProvider implements IRelationalDBProvider { ... }
```

### Dependency Injection
NestJS modules provide the correct implementation at runtime:

```typescript
@Module({
  providers: [
    {
      provide: 'RELATIONAL_DB_PROVIDER',
      useFactory: (config: ConfigService): IRelationalDBProvider => {
        const provider = config.get('relationaldb.provider') || 'sqlite';

        switch (provider) {
          case 'postgres': return new PostgresProvider(...);
          case 'sqlite': return new SQLiteProvider(...);
          default: return new SQLiteProvider(...);
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: ['RELATIONAL_DB_PROVIDER'],
})
export class RelationalDBModule {}
```

### Service Consumption
Services receive the provider via constructor injection:

```typescript
@Injectable()
export class MyService {
  constructor(
    @Inject('RELATIONAL_DB_PROVIDER')
    private db: IRelationalDBProvider
  ) {
    this.logger.log(`Using ${this.db.getName()}`);
  }
}
```

## Provider Layers

### 1. Relational Database Provider

**Package**: `@qckstrt/relationaldb-provider`

**Purpose**: Abstract relational database connections (SQLite, PostgreSQL, Aurora)

**Interface**:
```typescript
export interface IRelationalDBProvider {
  getName(): string;
  getType(): RelationalDBType;
  getConnectionOptions(entities: DataSourceOptions['entities']): DataSourceOptions;
  isAvailable(): Promise<boolean>;
}
```

**Implementations**:

| Provider | File | Use Case | Setup Time |
|----------|------|----------|------------|
| SQLite | `packages/relationaldb-provider/src/providers/sqlite.provider.ts` | Development, Testing | 0 seconds |
| PostgreSQL | `packages/relationaldb-provider/src/providers/postgres.provider.ts` | Production | 5-10 minutes |
| Aurora | `packages/relationaldb-provider/src/providers/aurora.provider.ts` | AWS Serverless | 10-15 minutes |

**Configuration**:
```bash
# Auto-detected based on NODE_ENV
NODE_ENV=development  # Uses SQLite
NODE_ENV=production   # Uses PostgreSQL

# Or explicit override
RELATIONAL_DB_PROVIDER=postgres
RELATIONAL_DB_HOST=localhost
RELATIONAL_DB_PORT=5432
RELATIONAL_DB_DATABASE=qckstrt
RELATIONAL_DB_USERNAME=user
RELATIONAL_DB_PASSWORD=password
```

**Module**: `RelationalDBModule`

**Consumed By**: `DbModule` (TypeORM integration)

---

### 2. Vector Database Provider

**Package**: `@qckstrt/vectordb-provider`

**Purpose**: Abstract vector storage and similarity search (ChromaDB, pgvector)

**Interface**:
```typescript
export interface IVectorDBProvider {
  initialize(): Promise<void>;

  createEmbeddings(
    userId: string,
    documentId: string,
    embeddings: number[][],
    content: string[]
  ): Promise<boolean>;

  queryEmbeddings(
    queryEmbedding: number[],
    userId: string,
    nResults?: number
  ): Promise<IVectorDocument[]>;

  deleteEmbeddingsByDocumentId(documentId: string): Promise<void>;
  deleteEmbeddingById(id: string): Promise<void>;

  getName(): string;
  getDimensions(): number;
}
```

**Implementations**:

| Provider | File | Use Case | Performance |
|----------|------|----------|-------------|
| ChromaDB | `packages/vectordb-provider/src/providers/chroma.provider.ts` | Development | Fast (dedicated) |
| pgvector | `packages/vectordb-provider/src/providers/pgvector.provider.ts` | Production | Fast (consolidated) |

**Configuration**:
```bash
# ChromaDB (default for dev)
VECTOR_DB_PROVIDER=chromadb
VECTOR_DB_CHROMA_URL=http://localhost:8000
VECTOR_DB_CHROMA_COLLECTION=qckstrt-embeddings

# pgvector (recommended for prod)
VECTOR_DB_PROVIDER=pgvector
# Uses existing PostgreSQL connection
```

**Module**: `VectorDBModule`

**Consumed By**: `KnowledgeService`

---

### 3. Embeddings Provider

**Package**: `@qckstrt/embeddings-provider`

**Purpose**: Generate vector embeddings from text (Xenova, Ollama)

**Interface**:
```typescript
export interface IEmbeddingProvider {
  embedDocuments(texts: string[]): Promise<number[][]>;
  embedQuery(text: string): Promise<number[]>;
  getDimensions(): number;
  getName(): string;
}
```

**Implementations**:

| Provider | File | Use Case | Dimensions | Setup |
|----------|------|----------|------------|-------|
| Xenova | `packages/embeddings-provider/src/providers/xenova.provider.ts` | Development (default) | 384 | None (auto-downloads) |
| Ollama | `packages/embeddings-provider/src/providers/ollama.provider.ts` | GPU acceleration | 768 | Requires Ollama server |

**Configuration**:
```bash
# Xenova (default - in-process)
EMBEDDINGS_PROVIDER=xenova
EMBEDDINGS_XENOVA_MODEL=Xenova/all-MiniLM-L6-v2

# Ollama (GPU-accelerated)
EMBEDDINGS_PROVIDER=ollama
EMBEDDINGS_OLLAMA_URL=http://localhost:11434
EMBEDDINGS_OLLAMA_MODEL=nomic-embed-text
```

**Module**: `EmbeddingsModule`

**Consumed By**: `EmbeddingsService` → `KnowledgeService`

**Text Processing**:
```typescript
// EmbeddingsService handles chunking
export class EmbeddingsService {
  async getEmbeddingsForText(text: string): Promise<{
    embeddings: number[][];
    texts: string[];
  }> {
    // 1. Split text into chunks
    const chunks = this.chunkText(text);

    // 2. Generate embeddings via provider
    const embeddings = await this.provider.embedDocuments(chunks);

    return { embeddings, texts: chunks };
  }
}
```

---

### 4. LLM Provider

**Package**: `@qckstrt/llm-provider`

**Purpose**: Generate text using language models (Ollama with Falcon/Llama/Mistral)

**Interface**:
```typescript
export interface ILLMProvider {
  getName(): string;
  getModelName(): string;

  generate(
    prompt: string,
    options?: GenerateOptions
  ): Promise<GenerateResult>;

  generateStream(
    prompt: string,
    options?: GenerateOptions
  ): AsyncGenerator<string, void, unknown>;

  chat(
    messages: ChatMessage[],
    options?: GenerateOptions
  ): Promise<GenerateResult>;

  isAvailable(): Promise<boolean>;
}
```

**Implementation**:

| Provider | File | Models | Use Case |
|----------|------|--------|----------|
| Ollama | `packages/llm-provider/src/providers/ollama.provider.ts` | Falcon 7B (default), Llama 3.2, Mistral, etc. | Self-hosted LLM |

**Configuration**:
```bash
# Ollama (self-hosted)
LLM_URL=http://localhost:11434
LLM_MODEL=falcon  # or llama3.2, mistral, etc.
```

**Module**: `LLMModule`

**Consumed By**: `KnowledgeService`

**Generation Options**:
```typescript
interface GenerateOptions {
  maxTokens?: number;      // Max tokens to generate (default: 512)
  temperature?: number;    // Randomness 0.0-1.0 (default: 0.7)
  topP?: number;          // Nucleus sampling (default: 0.95)
  topK?: number;          // Top-K sampling (default: 40)
  stopSequences?: string[]; // Stop generation at these strings
  stream?: boolean;        // Stream response token-by-token
}
```

---

## Benefits of Provider Pattern

### 1. Environment-Specific Defaults
```typescript
// Development: Zero setup
const provider = NODE_ENV === 'production' ? 'postgres' : 'sqlite';
```

### 2. Easy Testing
```typescript
// Test with in-memory database
RELATIONAL_DB_PROVIDER=sqlite
RELATIONAL_DB_DATABASE=:memory:
```

### 3. Gradual Migration
```typescript
// Start with ChromaDB, migrate to pgvector later
VECTOR_DB_PROVIDER=chromadb  // Week 1-4
VECTOR_DB_PROVIDER=pgvector  // Week 5+
```

### 4. No Code Changes
```bash
# Switch from SQLite to PostgreSQL
# Old: RELATIONAL_DB_PROVIDER=sqlite
# New: RELATIONAL_DB_PROVIDER=postgres
# That's it! No code changes needed.
```

### 5. Custom Implementations
```typescript
// Add your own provider
class MyCustomDBProvider implements IRelationalDBProvider {
  getName() { return 'MyCustomDB'; }
  // ... implement interface
}

// Register in module
case 'custom':
  return new MyCustomDBProvider(config);
```

## Provider Lifecycle

### 1. Module Initialization
```
Application Startup
  ↓
ConfigModule loads .env
  ↓
Provider Module (e.g., RelationalDBModule)
  ↓
useFactory called with ConfigService
  ↓
Reads RELATIONAL_DB_PROVIDER env var
  ↓
Instantiates correct provider class
  ↓
Provider exported with DI token
```

### 2. Service Injection
```
Service Constructor
  ↓
@Inject('PROVIDER_TOKEN') requests provider
  ↓
NestJS DI resolves provider instance
  ↓
Service uses provider via interface
```

### 3. Runtime Behavior
```
Service calls provider method
  ↓
Provider implementation handles details
  ↓
Service receives standardized response
  ↓
Service doesn't know/care which implementation was used
```

## Provider Selection Logic

### Relational Database
```typescript
// Auto-detection based on environment
const nodeEnv = process.env.NODE_ENV || 'development';
const provider = process.env.RELATIONAL_DB_PROVIDER ||
  (nodeEnv === 'production' ? 'postgres' : 'sqlite');
```

### Vector Database
```typescript
// Explicit configuration only
const provider = process.env.VECTOR_DB_PROVIDER || 'chromadb';
```

### Embeddings
```typescript
// Explicit configuration only
const provider = process.env.EMBEDDINGS_PROVIDER || 'xenova';
```

### LLM
```typescript
// Ollama only (model is configurable)
const url = process.env.LLM_URL || 'http://localhost:11434';
const model = process.env.LLM_MODEL || 'falcon';
```

## Adding a New Provider

### Step 1: Implement Interface
```typescript
// packages/[type]-provider/src/providers/my-provider.provider.ts
export class MyProvider implements IProviderInterface {
  constructor(private config: MyProviderConfig) {}

  // Implement all interface methods
  getName(): string { return 'MyProvider'; }
  // ...
}
```

### Step 2: Add to Module
```typescript
// packages/[type]-provider/src/[type].module.ts
useFactory: (config: ConfigService) => {
  const provider = config.get('provider.type');

  switch (provider) {
    case 'my-provider':
      return new MyProvider(/* config */);
    // ... other cases
  }
}
```

### Step 3: Export from Index
```typescript
// packages/[type]-provider/src/index.ts
export * from './providers/my-provider.provider';
```

### Step 4: Document
```typescript
// Add configuration example
// Add to README.md
// Update migration guide if applicable
```

## Error Handling

### Provider Initialization Errors
```typescript
useFactory: (config: ConfigService) => {
  try {
    const provider = createProvider(config);
    return provider;
  } catch (error) {
    throw new Error(`Failed to initialize provider: ${error.message}`);
  }
}
```

### Runtime Errors
```typescript
export class LLMError extends Error {
  constructor(
    public provider: string,
    public operation: string,
    public originalError: Error
  ) {
    super(`LLM operation '${operation}' failed in ${provider}: ${originalError.message}`);
    this.name = 'LLMError';
  }
}
```

### Availability Checks
```typescript
async isAvailable(): Promise<boolean> {
  try {
    // Provider-specific health check
    return await this.healthCheck();
  } catch (error) {
    this.logger.error('Availability check failed:', error);
    return false;
  }
}
```

## Best Practices

### 1. Interface-First Design
- Define interface before implementations
- Keep interfaces minimal and focused
- Use TypeScript for type safety

### 2. Configuration Over Code
- All provider selection via environment variables
- Sensible defaults for development
- Document all configuration options

### 3. Logging
- Log provider selection at startup
- Log provider operations (debug level)
- Log errors with context

### 4. Testing
- Test each provider implementation independently
- Test provider switching logic
- Test error handling

### 5. Documentation
- Document each provider's pros/cons
- Provide configuration examples
- Include migration guides

---

**Related Documentation**:
- [Data Layer Architecture](data-layer.md) - Database provider details
- [AI/ML Pipeline](ai-ml-pipeline.md) - Embeddings and LLM providers
- [Database Migration Guide](../guides/database-migration.md) - Switching providers
