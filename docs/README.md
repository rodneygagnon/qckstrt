# QCKSTRT Documentation

Welcome to the QCKSTRT documentation. This directory contains all technical documentation for the platform.

## Documentation Structure

### 📐 Architecture Documentation (`architecture/`)
As-built documentation describing how the system is designed and implemented.

- [**System Overview**](architecture/system-overview.md) - High-level architecture and design principles
- [**Provider Pattern**](architecture/provider-pattern.md) - Pluggable provider architecture
- [**Data Layer**](architecture/data-layer.md) - Database and vector storage architecture
- [**AI/ML Pipeline**](architecture/ai-ml-pipeline.md) - Embeddings, RAG, and LLM architecture
- [**Frontend Architecture**](architecture/frontend-architecture.md) - React/Next.js frontend design

### 📚 How-To Guides (`guides/`)
Practical guides for common tasks and workflows.

- [**Getting Started**](guides/getting-started.md) - Quick start guide for development
- [**Docker Setup**](guides/docker-setup.md) - Running services with Docker
- [**LLM Configuration**](guides/llm-configuration.md) - Configuring and switching LLM models
- [**RAG Implementation**](guides/rag-implementation.md) - Using the RAG system (backend)
- [**RAG Demo Guide**](guides/frontend-rag-demo.md) - Using the RAG demo (frontend)
- [**Frontend Testing**](guides/frontend-testing.md) - Testing the frontend application
- [**Database Migration**](guides/database-migration.md) - Migrating between database providers

## Quick Links

### For Developers
- [Getting Started Guide](guides/getting-started.md)
- [System Overview](architecture/system-overview.md)
- [Docker Setup](guides/docker-setup.md)

### For Frontend Developers
- [Frontend Architecture](architecture/frontend-architecture.md)
- [RAG Demo Guide](guides/frontend-rag-demo.md)
- [Frontend Testing](guides/frontend-testing.md)

### For DevOps/Infrastructure
- [Provider Pattern](architecture/provider-pattern.md)
- [Data Layer Architecture](architecture/data-layer.md)
- [Database Migration](guides/database-migration.md)

### For AI/ML Engineers
- [AI/ML Pipeline](architecture/ai-ml-pipeline.md)
- [LLM Configuration](guides/llm-configuration.md)
- [RAG Implementation](guides/rag-implementation.md)

## Core Principles

This platform is built on three core principles:

1. **100% Open Source** - All components use OSS licenses (Apache 2.0, MIT, etc.)
2. **Self-Hosted** - Complete control over data and infrastructure
3. **Pluggable Architecture** - Swap implementations without code changes

## Technology Stack

| Layer | Default Provider | Alternative Options |
|-------|-----------------|---------------------|
| **Embeddings** | Xenova (in-process) | Ollama |
| **Vector DB** | ChromaDB | pgvector, Qdrant, Weaviate |
| **Relational DB** | SQLite (dev), PostgreSQL (prod) | Aurora PostgreSQL |
| **LLM** | Ollama (Falcon 7B) | Any Ollama model |

## Platform Packages

The `packages/` directory contains reusable, publishable npm packages (`@qckstrt/*`) that implement the pluggable provider architecture:

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

See [Provider Pattern](architecture/provider-pattern.md) for implementation details.

## Support

For issues or questions:
- Check the relevant documentation section above
- Review architecture docs for design decisions
- Consult how-to guides for implementation details
