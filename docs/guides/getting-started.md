# Getting Started

This guide will get you up and running with QCKSTRT in under 10 minutes.

## Prerequisites

- **Node.js** 18+ and npm/pnpm
- **Docker** and Docker Compose
- **Git**

## Quick Start (5 Minutes)

### 1. Clone and Install

```bash
# Clone repository
git clone https://github.com/your-org/qckstrt.git
cd qckstrt

# Install dependencies
npm install
# or
pnpm install
```

### 2. Start Infrastructure Services

```bash
# Start PostgreSQL, ChromaDB, and Ollama
docker-compose up -d

# Verify all services are running
docker-compose ps
```

Expected output:
```
NAME                 STATUS          PORTS
qckstrt-postgres     Up 10 seconds   0.0.0.0:5432->5432/tcp
qckstrt-chromadb     Up 10 seconds   0.0.0.0:8000->8000/tcp
qckstrt-ollama       Up 10 seconds   0.0.0.0:11434->11434/tcp
```

### 3. Pull the Falcon LLM Model

```bash
# Run setup script
./scripts/setup-ollama.sh

# Or manually
docker exec qckstrt-ollama ollama pull falcon

# Verify
docker exec qckstrt-ollama ollama list
```

### 4. Configure Environment

```bash
# Copy environment template
cp apps/backend/.env.example apps/backend/.env

# The defaults are already configured for local development:
# - Embeddings: Xenova (in-process, no setup needed)
# - Vector DB: ChromaDB (localhost:8000)
# - LLM: Ollama/Falcon (localhost:11434)
# - Relational DB: SQLite (./data/dev.sqlite)
```

### 5. Start the Application

```bash
# Backend services
cd apps/backend
npm run start:dev
# This starts all microservices (API Gateway, Users, Documents, Knowledge, Files)

# Frontend (in another terminal)
cd apps/frontend
npm run dev
```

### 6. Verify It's Working

Open your browser to:
- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:3000/graphql
- **ChromaDB**: http://localhost:8000/api/v1/heartbeat
- **Ollama**: http://localhost:11434

**Test RAG**:
1. Upload a document via the frontend
2. Wait for indexing to complete (~1-5 seconds)
3. Ask a question about the document
4. Get an AI-generated answer!

---

## Architecture Overview

```
┌──────────────────────────────────────────────────┐
│          Frontend (React + Vite)                 │
│          http://localhost:5173                   │
└──────────────────────────────────────────────────┘
                      ↓ GraphQL
┌──────────────────────────────────────────────────┐
│         API Gateway (Apollo Federation)          │
│          http://localhost:3000                   │
└──────────────────────────────────────────────────┘
          ↓           ↓           ↓          ↓
    ┌─────────┐ ┌──────────┐ ┌────────┐ ┌────────┐
    │ Users   │ │Documents │ │Knowledge│ │ Files  │
    │  :3001  │ │  :3002   │ │  :3003 │ │  :3004 │
    └─────────┘ └──────────┘ └────────┘ └────────┘
          ↓           ↓           ↓          ↓
┌────────────────────────────────────────────────────┐
│              Provider Layer                        │
├────────────────────────────────────────────────────┤
│ SQLite    │ ChromaDB  │ Xenova    │ Ollama/Falcon │
│ (local)   │ :8000     │(in-proc)  │ :11434        │
└────────────────────────────────────────────────────┘
```

---

## Project Structure

```
qckstrt/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── apps/          # Microservices
│   │   │   │   ├── api/       # GraphQL Gateway (port 3000)
│   │   │   │   ├── users/     # Users Service (port 3001)
│   │   │   │   ├── documents/ # Documents Service (port 3002)
│   │   │   │   ├── knowledge/ # Knowledge/RAG Service (port 3003)
│   │   │   │   └── files/     # Files Service (port 3004)
│   │   │   ├── providers/     # Pluggable providers
│   │   │   │   ├── embeddings/
│   │   │   │   ├── vectordb/
│   │   │   │   ├── relationaldb/
│   │   │   │   └── llm/
│   │   │   ├── db/            # Database module
│   │   │   └── config/        # Configuration
│   │   └── .env               # Local environment config
│   └── frontend/              # React frontend
├── docs/                      # Documentation (you are here!)
│   ├── architecture/          # As-built architecture docs
│   └── guides/                # How-to guides
├── scripts/                   # Utility scripts
└── docker-compose.yml         # Infrastructure services
```

---

## Default Configuration

QCKSTRT comes with sensible defaults for local development:

### Embeddings: Xenova (Zero Setup)
- **Provider**: Xenova/Transformers.js
- **Model**: Xenova/all-MiniLM-L6-v2 (384 dimensions)
- **Runtime**: In-process (no external service)
- **First run**: Auto-downloads model from HuggingFace (~50MB)

### Vector Database: ChromaDB
- **Provider**: ChromaDB
- **URL**: http://localhost:8000
- **Collection**: qckstrt-embeddings
- **Storage**: Persistent (Docker volume)

### LLM: Ollama with Falcon 7B
- **Provider**: Ollama
- **URL**: http://localhost:11434
- **Model**: Falcon 7B (TII, Apache 2.0 license)
- **Setup**: Requires `ollama pull falcon`

### Relational Database: SQLite
- **Provider**: SQLite
- **File**: ./data/dev.sqlite
- **Setup**: None (auto-created)

---

## Common Tasks

### Upload and Index a Document

**Via Frontend**:
1. Go to http://localhost:5173
2. Click "Upload Document"
3. Select a text file or PDF
4. Wait for "Indexed successfully" message

**Via GraphQL**:
```graphql
mutation IndexDocument {
  indexDocument(
    userId: "user-1"
    documentId: "doc-1"
    text: "Your document text here..."
  ) {
    success
    message
  }
}
```

### Ask a Question (RAG)

**Via Frontend**:
1. Go to the "Knowledge" tab
2. Type your question
3. Click "Ask"
4. Wait for AI-generated answer (~2-5 seconds)

**Via GraphQL**:
```graphql
query AskQuestion {
  answerQuery(
    userId: "user-1"
    query: "What is the project status?"
  )
}
```

### View Indexed Documents

```graphql
query ListDocuments {
  documents(userId: "user-1") {
    id
    filename
    uploadedAt
  }
}
```

---

## Troubleshooting

### Ollama model not found

**Error**: `Error: model 'falcon' not found`

**Solution**:
```bash
# Pull the model
docker exec qckstrt-ollama ollama pull falcon

# Verify
docker exec qckstrt-ollama ollama list
```

### ChromaDB connection error

**Error**: `Failed to connect to ChromaDB at http://localhost:8000`

**Solution**:
```bash
# Check if ChromaDB is running
docker-compose ps chromadb

# Restart if needed
docker-compose restart chromadb

# View logs
docker-compose logs chromadb
```

### Port already in use

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different ports in .env
PORT=3010
```

### Xenova model download fails

**Error**: `Failed to download model from HuggingFace`

**Solution**:
1. Check internet connection
2. Try again (downloads can be flaky)
3. Clear cache: `rm -rf node_modules/@xenova/transformers/.cache`
4. Alternative: Switch to Ollama embeddings

---

## Next Steps

Now that you have QCKSTRT running:

1. **Explore the API**: http://localhost:3000/graphql (GraphQL Playground)
2. **Upload documents**: Try different file types (TXT, PDF, Markdown)
3. **Test RAG**: Ask questions about your documents
4. **Read architecture docs**: [System Overview](../architecture/system-overview.md)
5. **Customize providers**: [LLM Configuration](llm-configuration.md)

---

## Development Workflow

### Backend Development

```bash
cd apps/backend

# Start in watch mode (auto-restart on changes)
npm run start:dev

# Run specific service
npm run start:dev -- api        # API Gateway only
npm run start:dev -- knowledge  # Knowledge service only

# Build for production
npm run build

# Run tests
npm run test
npm run test:watch
```

### Frontend Development

```bash
cd apps/frontend

# Start dev server with HMR
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Docker Services

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart ollama

# Remove all data (fresh start)
docker-compose down -v
```

---

## Production Deployment

For production deployment, see:
- [System Overview](../architecture/system-overview.md#deployment-architecture)
- [Database Migration](database-migration.md) (SQLite → PostgreSQL)
- [Docker Setup](docker-setup.md) (Production configuration)

**Key Changes for Production**:
1. Switch to PostgreSQL: `RELATIONAL_DB_PROVIDER=postgres`
2. Consider pgvector: `VECTOR_DB_PROVIDER=pgvector`
3. Use managed Ollama with GPU instances
4. Enable SSL/TLS for all connections
5. Set up monitoring and logging
6. Configure backups

---

## Getting Help

- **Documentation**: Start with [docs/README.md](../README.md)
- **Architecture**: [System Overview](../architecture/system-overview.md)
- **Configuration**: [LLM Configuration](llm-configuration.md)
- **Issues**: Check GitHub issues or create a new one

## License

Apache 2.0 - See LICENSE file for details
