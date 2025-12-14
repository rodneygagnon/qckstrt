# QCKSTRT

A full-stack platform with 100% open-source AI/ML capabilities for semantic search and RAG (Retrieval-Augmented Generation).

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/your-org/qckstrt.git
cd qckstrt
npm install

# Start infrastructure
docker-compose up -d

# Pull LLM model
./scripts/setup-ollama.sh

# Start application
cd apps/backend && npm run start:dev
cd apps/frontend && npm run dev
```

**See [Getting Started Guide](docs/guides/getting-started.md) for detailed setup instructions.**

## 📚 Documentation

All documentation is located in the [`docs/`](docs/) directory:

### For Developers
- **[Getting Started](docs/guides/getting-started.md)** - Set up your development environment (5 minutes)
- **[System Overview](docs/architecture/system-overview.md)** - High-level architecture
- **[RAG Implementation](docs/guides/rag-implementation.md)** - Using the AI/ML pipeline

### For DevOps
- **[Docker Setup](docs/guides/docker-setup.md)** - Infrastructure services
- **[Database Migration](docs/guides/database-migration.md)** - Migrating between providers
- **[Provider Pattern](docs/architecture/provider-pattern.md)** - Pluggable architecture

### For AI/ML Engineers
- **[AI/ML Pipeline](docs/architecture/ai-ml-pipeline.md)** - Embeddings, RAG, and LLM
- **[LLM Configuration](docs/guides/llm-configuration.md)** - Configuring and switching models
- **[Data Layer](docs/architecture/data-layer.md)** - Vector and relational databases

## Core Principles

1. **100% Open Source** - All components use OSS licenses (Apache 2.0, MIT, etc.)
2. **Self-Hosted First** - Complete control over data and infrastructure
3. **Pluggable Architecture** - Swap implementations without code changes

## Prerequisites

- **Node.js** 18+ and npm/pnpm
- **Docker** and Docker Compose
- **Git**
- **AWS Account** (for production deployment)

## Technology Stack

### Frontend
- [React](https://react.dev) + [Vite](https://vitejs.dev) - Modern web UI
- [TailwindCSS](https://tailwindcss.com) - Utility-first CSS
- [GraphQL Client](https://www.apollographql.com) - API integration

### Backend (Microservices)
- [NestJS](https://nestjs.com) - Node.js framework
- [GraphQL Federation](https://www.apollographql.com/docs/federation/) - Unified API gateway
- [TypeORM](https://typeorm.io) - Database ORM

### AI/ML Stack (100% OSS)

| Component | Default Provider | Alternative Options |
|-----------|-----------------|---------------------|
| **Embeddings** | Xenova (in-process) | Ollama |
| **Vector DB** | ChromaDB | pgvector, Qdrant, Weaviate |
| **Relational DB** | SQLite (dev), PostgreSQL (prod) | Aurora PostgreSQL |
| **LLM** | Ollama (Falcon 7B) | Any Ollama model |

### Infrastructure
- [Docker](https://www.docker.com) - Containerization
- [Docker Compose](https://docs.docker.com/compose/) - Local orchestration
- [Terraform](https://www.terraform.io) - AWS infrastructure as code
- [Kubernetes](https://kubernetes.io) - Production orchestration

### AWS Services (Production)
- [AWS Cognito](https://aws.amazon.com/cognito/) - User authentication
- [AWS RDS](https://aws.amazon.com/rds/) - Managed PostgreSQL
- [AWS S3](https://aws.amazon.com/s3/) - Object storage
- [AWS ECS](https://aws.amazon.com/ecs/) - Container orchestration
- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) - Secrets management

## Project Structure

```
qckstrt/
├── packages/                 # 📦 Reusable platform packages (@qckstrt/*)
│   ├── common/               # Shared types and interfaces
│   ├── llm-provider/         # LLM integration (Ollama)
│   ├── embeddings-provider/  # Embeddings (Xenova, Ollama)
│   ├── vectordb-provider/    # Vector DB (ChromaDB)
│   ├── relationaldb-provider/# Relational DB (PostgreSQL, SQLite, Aurora)
│   ├── extraction-provider/  # Text extraction
│   ├── storage-provider/     # File storage (AWS S3)
│   ├── auth-provider/        # Authentication (AWS Cognito)
│   └── secrets-provider/     # Secrets management (AWS Secrets Manager)
├── apps/
│   ├── backend/              # NestJS microservices
│   │   └── src/
│   │       └── apps/         # Services (API Gateway, Users, Documents, Knowledge, Files)
│   └── frontend/             # React + Next.js application
├── docs/                     # 📚 All documentation
│   ├── architecture/         # As-built architecture documentation
│   └── guides/               # How-to guides
├── infra/                    # Terraform AWS infrastructure
├── scripts/                  # Utility scripts
└── docker-compose.yml        # Local development services
```

### Platform Packages

The `packages/` directory contains reusable, publishable npm packages that provide pluggable provider implementations:

| Package | Purpose | Tests |
|---------|---------|-------|
| `@qckstrt/common` | Shared types and interfaces | - |
| `@qckstrt/llm-provider` | Ollama LLM integration | 16 |
| `@qckstrt/embeddings-provider` | Xenova/Ollama embeddings | 24 |
| `@qckstrt/vectordb-provider` | ChromaDB vector storage | 18 |
| `@qckstrt/relationaldb-provider` | PostgreSQL, SQLite, Aurora | 19 |
| `@qckstrt/extraction-provider` | Text extraction from URLs | 16 |
| `@qckstrt/storage-provider` | AWS S3 file storage | 17 |
| `@qckstrt/auth-provider` | AWS Cognito authentication | 23 |
| `@qckstrt/secrets-provider` | AWS Secrets Manager | 10 |

## Development

### Backend
```bash
cd apps/backend
npm run start:dev        # All microservices with hot-reload
npm run start:dev -- api # API Gateway only
npm run build           # Production build
npm run test            # Run tests
```

### Frontend
```bash
cd apps/frontend
npm run dev             # Dev server with HMR
npm run build           # Production build
npm run preview         # Preview production build
```

### Infrastructure Services
```bash
docker-compose up -d     # Start all services
docker-compose down      # Stop all services
docker-compose logs -f   # View logs
```

## Features

- ✅ **RAG (Retrieval-Augmented Generation)** - Ask questions about your documents
- ✅ **Semantic Search** - Find relevant information using vector similarity
- ✅ **Document Indexing** - Automatic chunking and embedding generation
- ✅ **Multi-Model Support** - Switch between Falcon, Llama, Mistral, etc.
- ✅ **Pluggable Providers** - Swap databases and AI models via configuration
- ✅ **GraphQL Federation** - Unified API across microservices
- ✅ **100% Self-Hosted** - Complete data control and privacy

## License

Apache 2.0 - See LICENSE file for details

## Support

- 📖 Documentation: [docs/README.md](docs/README.md)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/qckstrt/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-org/qckstrt/discussions)