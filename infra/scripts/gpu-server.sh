#!/bin/bash
set -e

# =============================================================================
# QCKSTRT GPU Server Setup
# =============================================================================
# This script sets up:
# - vLLM for LLM inference (OpenAI-compatible API)
# - Text Embeddings Inference for embedding generation
#
# Uses AWS Deep Learning AMI which has NVIDIA drivers pre-installed
# =============================================================================

exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

echo "=========================================="
echo "Starting QCKSTRT GPU Server Setup"
echo "=========================================="

# Wait for NVIDIA drivers (they're pre-installed on Deep Learning AMI)
echo "Checking NVIDIA drivers..."
nvidia-smi

# Update system
apt-get update
apt-get upgrade -y

# Make sure Docker is running with NVIDIA runtime
systemctl enable docker
systemctl start docker

# Configure Docker to use NVIDIA runtime by default
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

# Create working directory
mkdir -p /opt/qckstrt
cd /opt/qckstrt

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
chown -R ubuntu:ubuntu /opt/qckstrt

# Start services
cd /opt/qckstrt
docker-compose up -d

# Wait for services to start
echo "Waiting for AI services to initialize..."
sleep 60

# Check service health
echo "Checking vLLM..."
curl -s http://localhost:8000/v1/models || echo "vLLM still starting..."

echo "Checking Embeddings..."
curl -s http://localhost:8001/info || echo "Embeddings still starting..."

PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

echo "=========================================="
echo "QCKSTRT GPU Server Setup Complete!"
echo "=========================================="
echo ""
echo "vLLM API (OpenAI-compatible): http://$PUBLIC_IP:8000"
echo "  - Test: curl http://$PUBLIC_IP:8000/v1/models"
echo ""
echo "Embeddings API: http://$PUBLIC_IP:8001"
echo "  - Test: curl http://$PUBLIC_IP:8001/info"
echo ""
echo "Note: First model download may take 10-20 minutes"
