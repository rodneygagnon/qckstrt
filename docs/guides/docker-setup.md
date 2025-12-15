# Docker Setup - OSS Self-Hosted Stack

This project uses a 100% open-source, self-hosted AI/ML stack for maximum transparency and privacy.

## Services

Your `docker-compose.yml` includes:

| Service | Purpose | Port | Image |
|---------|---------|------|-------|
| **PostgreSQL + pgvector** | Relational + Vector database | 5432 | Supabase stack |
| **Ollama** | LLM inference (Falcon 7B) | 11434 | `ollama/ollama:latest` |

## Quick Start

### 1. Start all services

```bash
docker-compose up -d
```

### 2. Pull the Falcon 7B model

```bash
./scripts/setup-ollama.sh
```

Or manually:
```bash
docker exec qckstrt-ollama ollama pull falcon
```

### 3. Verify everything is running

```bash
# Check all containers
docker-compose ps

# Check PostgreSQL
docker exec qckstrt-supabase-db pg_isready -U postgres

# Check pgvector extension
docker exec qckstrt-supabase-db psql -U postgres -c "SELECT * FROM pg_extension WHERE extname = 'vector';"

# Check Ollama
docker exec qckstrt-ollama ollama list
```

## Configuration

Your application is configured to use these services via environment variables in `apps/backend/.env`:

```bash
# Embeddings: Xenova (in-process, no external service needed)
EMBEDDINGS_PROVIDER='xenova'

# Vector DB: pgvector (uses same PostgreSQL instance)
VECTOR_DB_DIMENSIONS=384

# LLM: Ollama with Falcon 7B
LLM_URL='http://localhost:11434'
LLM_MODEL='falcon'
```

## Development Workflow

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### Stop and remove all data
```bash
docker-compose down -v
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f ollama
```

## Switching Models

To use a different Ollama model:

1. Pull the model:
```bash
docker exec qckstrt-ollama ollama pull mistral
```

2. Update `apps/backend/.env`:
```bash
LLM_MODEL='mistral'
```

3. Restart your backend application

Available models: https://ollama.ai/library

## GPU Support (Optional)

If you have an NVIDIA GPU and want faster inference:

1. Install [nvidia-docker](https://github.com/NVIDIA/nvidia-docker)

2. Uncomment the GPU section in `docker-compose.yml`:
```yaml
ollama:
  # ...
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: 1
            capabilities: [gpu]
```

3. Restart the Ollama container:
```bash
docker-compose up -d ollama
```

## Data Persistence

All data is persisted in Docker volumes:

- `qckstrt-supabase-data` - PostgreSQL database (relational + vector data)
- `qckstrt-ollama-data` - Downloaded Ollama models

To backup:
```bash
docker volume inspect qckstrt-supabase-data
docker volume inspect qckstrt-ollama-data
```

## Troubleshooting

### Ollama model not found
```bash
# Pull the model again
docker exec qckstrt-ollama ollama pull falcon

# Verify it's installed
docker exec qckstrt-ollama ollama list
```

### PostgreSQL connection issues
```bash
# Check if it's ready
docker exec qckstrt-supabase-db pg_isready -U postgres

# View logs
docker-compose logs supabase-db
```

### pgvector extension not available
```bash
# Check if extension is installed
docker exec qckstrt-supabase-db psql -U postgres -c "SELECT * FROM pg_available_extensions WHERE name = 'vector';"

# Install if needed
docker exec qckstrt-supabase-db psql -U postgres -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

## Architecture

```
┌─────────────────────────────────────────┐
│         Your Application                │
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌───────┐ │
│  │ Xenova   │  │PostgreSQL│  │Ollama │ │
│  │(in-proc) │  │+ pgvector│  │ (LLM) │ │
│  └──────────┘  └──────────┘  └───────┘ │
│                 ↓              ↓       │
│            localhost:5432  localhost:  │
│                              11434     │
└─────────────────────────────────────────┘

100% OSS • 100% Self-Hosted • 100% Private
```

## Production Deployment

For production, consider:

1. **Use managed PostgreSQL with pgvector** (AWS RDS, Supabase Cloud, etc.)
2. **Deploy Ollama** on GPU instances for better performance
3. **Use environment-specific configs** (production.env)

See the platform packages for implementations:
- `packages/relationaldb-provider/` - PostgreSQL provider
- `packages/vectordb-provider/` - pgvector provider
- `packages/llm-provider/` - Ollama provider
