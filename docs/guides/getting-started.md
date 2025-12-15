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
# Start Supabase, ChromaDB, and Ollama
docker-compose up -d

# Verify all services are running
docker-compose ps
```

Expected output:
```
NAME                      STATUS          PORTS
qckstrt-supabase-db       Up              0.0.0.0:5432->5432/tcp
qckstrt-supabase-kong     Up              0.0.0.0:8000->8000/tcp
qckstrt-supabase-studio   Up              0.0.0.0:3100->3000/tcp
qckstrt-chromadb          Up              0.0.0.0:8001->8000/tcp
qckstrt-ollama            Up              0.0.0.0:11434->11434/tcp
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
# - Vector DB: ChromaDB (localhost:8001)
# - LLM: Ollama/Falcon (localhost:11434)
# - Relational DB: PostgreSQL via Supabase (localhost:5432)
# - Auth/Storage/Secrets: Supabase (localhost:8000)
```

### 5. Start the Application

```bash
# Backend services
cd apps/backend
npm run start:dev
# This starts all microservices (API Gateway, Users, Documents, Knowledge)

# Frontend (in another terminal)
cd apps/frontend
npm run dev
```

### 6. Verify It's Working

Open your browser to:
- **API Gateway (GraphQL Playground)**: http://localhost:3000/graphql
- **Frontend**: http://localhost:5173
- **Supabase Studio**: http://localhost:3100
- **Supabase API**: http://localhost:8000
- **ChromaDB**: http://localhost:8001/api/v1/heartbeat
- **Ollama**: http://localhost:11434

**Test the RAG Pipeline**:

1. Open http://localhost:3000/graphql in your browser

2. Index a test document:
```graphql
mutation {
  indexDocument(
    userId: "test-user"
    documentId: "test-doc"
    text: "QCKSTRT is a full-stack platform with RAG capabilities."
  ) {
    success
    message
  }
}
```

3. Ask a question:
```graphql
query {
  answerQuery(
    userId: "test-user"
    query: "What is QCKSTRT?"
  )
}
```

4. You should get an AI-generated answer based on the indexed document!

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
          ↓           ↓           ↓
    ┌─────────┐ ┌──────────┐ ┌──────────┐
    │ Users   │ │Documents │ │Knowledge │
    │  :3001  │ │  :3002   │ │  :3003   │
    └─────────┘ └──────────┘ └──────────┘
          ↓           ↓           ↓
┌────────────────────────────────────────────────────┐
│              Provider Layer                        │
├────────────────────────────────────────────────────┤
│ Supabase  │ ChromaDB  │ Xenova    │ Ollama/Falcon │
│ :5432     │ :8001     │(in-proc)  │ :11434        │
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
│   │   │   │   ├── users/     # Users Service (port 3001)
│   │   │   │   ├── documents/ # Documents Service (port 3002)
│   │   │   │   └── knowledge/ # Knowledge/RAG Service (port 3003)
│   │   │   ├── api/           # GraphQL Gateway (port 3000)
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
- **URL**: http://localhost:8001
- **Collection**: qckstrt-embeddings
- **Storage**: Persistent (Docker volume)

### LLM: Ollama with Falcon 7B
- **Provider**: Ollama
- **URL**: http://localhost:11434
- **Model**: Falcon 7B (TII, Apache 2.0 license)
- **Setup**: Requires `ollama pull falcon`

### Relational Database: PostgreSQL via Supabase
- **Provider**: PostgreSQL
- **Host**: localhost:5432
- **Database**: postgres
- **Setup**: Automatic via docker-compose

### Auth/Storage/Secrets: Supabase
- **Auth**: Supabase Auth (GoTrue)
- **Storage**: Supabase Storage
- **Secrets**: Supabase Vault
- **API**: http://localhost:8000
- **Studio**: http://localhost:3100

---

## Common Tasks

### Index a Document

Index text for semantic search and RAG using the GraphQL API:

```graphql
mutation IndexDocument {
  indexDocument(
    userId: "user-123"
    documentId: "quarterly-report-q4"
    text: """
    Q4 2024 Financial Report

    Revenue: $1.2M (up 25% from Q3)
    Key achievements:
    - Launched new product line
    - Expanded to 3 new markets
    - Team grew to 25 people

    Goals for Q1 2025:
    - Reach $1.5M revenue
    - Launch mobile app
    - Hire 5 more engineers
    """
  ) {
    success
    message
  }
}
```

**Response**:
```json
{
  "data": {
    "indexDocument": {
      "success": true,
      "message": "Document indexed successfully with 3 chunks"
    }
  }
}
```

### Ask Questions Using RAG

Query your indexed documents using natural language:

```graphql
query AskQuestion {
  answerQuery(
    userId: "user-123"
    query: "What was the Q4 revenue and what are the Q1 goals?"
  )
}
```

**Response**:
```json
{
  "data": {
    "answerQuery": "Q4 2024 revenue was $1.2M, which represents a 25% increase from Q3. The goals for Q1 2025 include reaching $1.5M in revenue, launching a mobile app, and hiring 5 more engineers."
  }
}
```

### Semantic Search (Without LLM)

Search for relevant text chunks without generating an answer:

```graphql
query SearchDocuments {
  searchText(
    userId: "user-123"
    query: "revenue growth"
    count: 3
  )
}
```

**Response**:
```json
{
  "data": {
    "searchText": [
      "Revenue: $1.2M (up 25% from Q3)",
      "Goals for Q1 2025: Reach $1.5M revenue",
      "Q4 2024 Financial Report"
    ]
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

**Error**: `Failed to connect to ChromaDB at http://localhost:8001`

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
- [Database Migration](database-migration.md) (ChromaDB → pgvector)
- [Docker Setup](docker-setup.md) (Production configuration)

**Key Changes for Production**:
1. Use managed PostgreSQL (Supabase Cloud or self-hosted)
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
