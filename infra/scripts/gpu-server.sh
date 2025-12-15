#!/bin/bash

# =============================================================================
# QCKSTRT GPU Server Setup
# =============================================================================
# This script sets up:
# - vLLM for LLM inference (OpenAI-compatible API)
# - Text Embeddings Inference for embedding generation
#
# Uses AWS Deep Learning AMI which has NVIDIA drivers pre-installed
#
# Features:
# - Retry logic for network operations
# - Health checks instead of hardcoded sleeps
# - Idempotency (safe to re-run)
# - Comprehensive logging
# - GPU verification
# =============================================================================

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------

SETUP_DIR="/opt/qckstrt"
MARKER_FILE="/opt/qckstrt/.setup-complete"
LOG_FILE="/var/log/user-data.log"
MAX_RETRIES=5
RETRY_DELAY=10

# -----------------------------------------------------------------------------
# Logging
# -----------------------------------------------------------------------------

exec > >(tee -a "$LOG_FILE" | logger -t user-data -s 2>/dev/console) 2>&1

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log_error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >&2
}

log_success() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS: $1"
}

# -----------------------------------------------------------------------------
# Utility Functions
# -----------------------------------------------------------------------------

# Retry a command with exponential backoff
retry() {
    local max_attempts=$1
    local delay=$2
    shift 2
    local cmd="$@"
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        log "Attempt $attempt/$max_attempts: $cmd"
        if eval "$cmd"; then
            return 0
        fi
        log_error "Attempt $attempt failed. Retrying in ${delay}s..."
        sleep $delay
        delay=$((delay * 2))
        attempt=$((attempt + 1))
    done

    log_error "All $max_attempts attempts failed for: $cmd"
    return 1
}

# Check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Wait for a service to be healthy
wait_for_healthy() {
    local service_name=$1
    local check_cmd=$2
    local max_wait=${3:-300}  # Default 5 minutes
    local interval=${4:-10}

    log "Waiting for $service_name to be healthy (max ${max_wait}s)..."
    local elapsed=0

    while [ $elapsed -lt $max_wait ]; do
        if eval "$check_cmd" >/dev/null 2>&1; then
            log_success "$service_name is healthy after ${elapsed}s"
            return 0
        fi
        sleep $interval
        elapsed=$((elapsed + interval))
    done

    log_error "$service_name did not become healthy within ${max_wait}s"
    return 1
}

# -----------------------------------------------------------------------------
# Main Setup
# -----------------------------------------------------------------------------

log "=========================================="
log "Starting QCKSTRT GPU Server Setup"
log "=========================================="

# Check if setup already completed
if [ -f "$MARKER_FILE" ]; then
    log "Setup already completed. Checking services..."
    cd "$SETUP_DIR"
    if docker-compose ps | grep -q "Up"; then
        log_success "Services are running. Nothing to do."
        exit 0
    else
        log "Services not running. Restarting..."
        docker-compose up -d
        exit 0
    fi
fi

# -----------------------------------------------------------------------------
# Step 1: Verify GPU and NVIDIA Drivers
# -----------------------------------------------------------------------------

log "Step 1: Verifying GPU and NVIDIA drivers..."

# Wait for NVIDIA drivers to be ready (they're pre-installed on Deep Learning AMI)
if ! wait_for_healthy "NVIDIA Drivers" "nvidia-smi" 120 10; then
    log_error "NVIDIA drivers not available. This instance may not have a GPU."
    log "Continuing anyway - services will fail if GPU is required"
fi

# Log GPU info
if command_exists nvidia-smi; then
    log "GPU Information:"
    nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader
fi

# -----------------------------------------------------------------------------
# Step 2: System Update
# -----------------------------------------------------------------------------

log "Step 2: Updating system packages..."

if ! retry $MAX_RETRIES $RETRY_DELAY "apt-get update"; then
    log_error "Failed to update apt cache"
    # Don't exit - try to continue
fi

export DEBIAN_FRONTEND=noninteractive
retry 3 $RETRY_DELAY "apt-get upgrade -y -o Dpkg::Options::='--force-confdef' -o Dpkg::Options::='--force-confold'" || true

# -----------------------------------------------------------------------------
# Step 3: Ensure Docker is Running with NVIDIA Runtime
# -----------------------------------------------------------------------------

log "Step 3: Configuring Docker with NVIDIA runtime..."

# Docker should be pre-installed on Deep Learning AMI
if ! command_exists docker; then
    log "Docker not found. Installing..."
    retry $MAX_RETRIES $RETRY_DELAY "curl -fsSL https://get.docker.com | sh"
fi

# Ensure docker group and permissions
usermod -aG docker ubuntu 2>/dev/null || true
systemctl enable docker

# Configure Docker to use NVIDIA runtime by default (if not already configured)
if [ ! -f /etc/docker/daemon.json ] || ! grep -q "nvidia" /etc/docker/daemon.json; then
    log "Configuring NVIDIA runtime for Docker..."
    cat > /etc/docker/daemon.json <<'EOF'
{
    "default-runtime": "nvidia",
    "runtimes": {
        "nvidia": {
            "path": "nvidia-container-runtime",
            "runtimeArgs": []
        }
    }
}
EOF
    systemctl restart docker
fi

systemctl start docker

# Wait for Docker to be ready
wait_for_healthy "Docker" "docker info" 60 5 || exit 1

# Verify NVIDIA runtime is available
if docker info 2>/dev/null | grep -q "nvidia"; then
    log_success "Docker NVIDIA runtime is configured"
else
    log_error "Docker NVIDIA runtime may not be configured correctly"
fi

# -----------------------------------------------------------------------------
# Step 4: Create Working Directory and Configuration
# -----------------------------------------------------------------------------

log "Step 4: Creating configuration files..."

mkdir -p "$SETUP_DIR"
cd "$SETUP_DIR"

# Create docker-compose for AI services
cat > docker-compose.yml <<'DOCKEREOF'
version: '3.8'

services:
  # vLLM - OpenAI-compatible LLM inference
  vllm:
    image: vllm/vllm-openai:latest
    container_name: vllm
    restart: unless-stopped
    runtime: nvidia
    ports:
      - "8000:8000"
    volumes:
      - huggingface-cache:/root/.cache/huggingface
    environment:
      - HUGGING_FACE_HUB_TOKEN=${HUGGING_FACE_HUB_TOKEN:-}
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    command: >
      --model mistralai/Mistral-7B-Instruct-v0.2
      --gpu-memory-utilization 0.90
      --max-model-len 8192
      --dtype auto
      --trust-remote-code
    healthcheck:
      test: ["CMD", "curl", "-sf", "http://localhost:8000/v1/models"]
      interval: 30s
      timeout: 10s
      retries: 10
      start_period: 300s

  # Text Embeddings Inference - for generating embeddings
  embeddings:
    image: ghcr.io/huggingface/text-embeddings-inference:1.2
    container_name: embeddings
    restart: unless-stopped
    ports:
      - "8001:80"
    volumes:
      - embeddings-cache:/data
    command: >
      --model-id BAAI/bge-large-en-v1.5
      --max-concurrent-requests 512
    healthcheck:
      test: ["CMD", "curl", "-sf", "http://localhost:80/info"]
      interval: 30s
      timeout: 10s
      retries: 10
      start_period: 120s

volumes:
  huggingface-cache:
  embeddings-cache:
DOCKEREOF

# Create .env file (for optional HuggingFace token)
cat > .env <<'ENVEOF'
# Optional: Add HuggingFace token for gated models
# HUGGING_FACE_HUB_TOKEN=your_token_here
ENVEOF

# Set proper ownership
chown -R ubuntu:ubuntu "$SETUP_DIR"

log_success "Configuration files created"

# -----------------------------------------------------------------------------
# Step 5: Pull Docker Images
# -----------------------------------------------------------------------------

log "Step 5: Pulling Docker images (this may take a while)..."

cd "$SETUP_DIR"

# Pull images with retry - these are large images
retry $MAX_RETRIES $RETRY_DELAY "docker-compose pull" || {
    log_error "Failed to pull some images, will try on startup"
}

# -----------------------------------------------------------------------------
# Step 6: Start Services
# -----------------------------------------------------------------------------

log "Step 6: Starting services..."

cd "$SETUP_DIR"
docker-compose up -d

# -----------------------------------------------------------------------------
# Step 7: Health Checks
# -----------------------------------------------------------------------------

log "Step 7: Running health checks..."
log "Note: Model downloads may take 10-20 minutes on first run"

# Wait for embeddings service (smaller model, should be ready first)
wait_for_healthy "Embeddings API" "curl -sf http://localhost:8001/info" 600 15 || {
    log_error "Embeddings service health check failed"
    log "Container logs:"
    docker logs embeddings --tail 50
}

# Wait for vLLM service (larger model, takes longer)
wait_for_healthy "vLLM API" "curl -sf http://localhost:8000/v1/models" 900 30 || {
    log_error "vLLM service health check failed"
    log "Container logs:"
    docker logs vllm --tail 50
    log "Note: vLLM may still be downloading/loading the model"
}

# -----------------------------------------------------------------------------
# Completion
# -----------------------------------------------------------------------------

# Mark setup as complete
touch "$MARKER_FILE"
echo "$(date '+%Y-%m-%d %H:%M:%S')" > "$MARKER_FILE"

PUBLIC_IP=$(curl -sf http://169.254.169.254/latest/meta-data/public-ipv4 || echo "unknown")

log "=========================================="
log_success "QCKSTRT GPU Server Setup Complete!"
log "=========================================="
log ""
log "vLLM API (OpenAI-compatible): http://$PUBLIC_IP:8000"
log "  - Test: curl http://$PUBLIC_IP:8000/v1/models"
log ""
log "Embeddings API: http://$PUBLIC_IP:8001"
log "  - Test: curl http://$PUBLIC_IP:8001/info"
log ""
log "Note: First model download may take 10-20 minutes"
log ""

# Show GPU utilization
if command_exists nvidia-smi; then
    log "Current GPU Status:"
    nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total --format=csv,noheader
fi

log ""
log "Setup completed at: $(date)"
