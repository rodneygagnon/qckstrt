# Docker Setup - OSS Self-Hosted Stack

This project uses a 100% open-source, self-hosted AI/ML stack for maximum transparency and privacy.

## Services

Your `docker-compose.yml` includes:

| Service | Purpose | Port | Image |
|---------|---------|------|-------|
| **PostgreSQL** | Relational database | 5432 | `postgres:16-alpine` |
| **ChromaDB** | Vector database for embeddings | 8000 | `chromadb/chroma:latest` |
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
docker exec qckstrt-postgres pg_isready -U qckstrt_user -d qckstrt

# Check ChromaDB
curl http://localhost:8000/api/v1/heartbeat

# Check Ollama
docker exec qckstrt-ollama ollama list
```

## Configuration

Your application is configured to use these services via environment variables in `apps/backend/.env`:

```bash
# Embeddings: Xenova (in-process, no external service needed)
EMBEDDINGS_PROVIDER='xenova'

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

- `qckstrt-postgres-data` - PostgreSQL database
- `qckstrt-chroma-data` - ChromaDB vector embeddings
- `qckstrt-ollama-data` - Downloaded Ollama models

To backup:
```bash
docker volume inspect qckstrt-postgres-data
docker volume inspect qckstrt-chroma-data
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

### ChromaDB connection issues
```bash
# Check if it's running
curl http://localhost:8000/api/v1/heartbeat

# View logs
docker-compose logs chromadb
```

### PostgreSQL connection issues
```bash
# Check if it's ready
docker exec qckstrt-postgres pg_isready -U qckstrt_user -d qckstrt

# View logs
docker-compose logs postgres
```

## Architecture

```
┌─────────────────────────────────────────┐
│         Your Application                │
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌───────┐│
│  │ Xenova   │  │ ChromaDB │  │Ollama ││
│  │(in-proc) │  │(vectors) │  │ (LLM) ││
│  └──────────┘  └──────────┘  └───────┘│
│                 ↓              ↓       │
│            localhost:8000  localhost:  │
│                              11434     │
└─────────────────────────────────────────┘

100% OSS • 100% Self-Hosted • 100% Private
```

## Production Deployment

For production, consider:

1. **Use managed PostgreSQL** (AWS RDS, Azure Database, etc.)
2. **Scale ChromaDB** horizontally or migrate to pgvector
3. **Deploy Ollama** on GPU instances for better performance
4. **Use environment-specific configs** (production.env)

See your provider modules for swapping implementations:
- `apps/backend/src/providers/relationaldb/`
- `apps/backend/src/providers/vectordb/`
- `apps/backend/src/providers/llm/`
