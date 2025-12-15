#!/bin/bash
set -e

# =============================================================================
# QCKSTRT Application Server Setup
# =============================================================================
# This script sets up:
# - Docker and Docker Compose
# - Self-hosted Supabase stack (PostgreSQL, Auth, Storage, Realtime)
# - pgvector extension for vector storage
# - Redis for caching
# =============================================================================

exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

echo "=========================================="
echo "Starting QCKSTRT App Server Setup"
echo "=========================================="

# Update system
apt-get update
apt-get upgrade -y

# Install dependencies
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    jq \
    unzip

# Install Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker ubuntu
systemctl enable docker
systemctl start docker

# Install Docker Compose
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | jq -r .tag_name)
curl -L "https://github.com/docker/compose/releases/download/$${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install
rm -rf aws awscliv2.zip

# Get secrets from AWS Secrets Manager
echo "Fetching secrets from AWS Secrets Manager..."
SECRETS=$(aws secretsmanager get-secret-value \
    --secret-id ${secret_arn} \
    --region ${aws_region} \
    --query SecretString \
    --output text)

POSTGRES_PASSWORD=$(echo $SECRETS | jq -r '.postgres_password')
JWT_SECRET=$(echo $SECRETS | jq -r '.jwt_secret')
ANON_KEY=$(echo $SECRETS | jq -r '.anon_key')
SERVICE_ROLE_KEY=$(echo $SECRETS | jq -r '.service_role_key')

# Create working directory
mkdir -p /opt/qckstrt
cd /opt/qckstrt

# Create docker-compose.yml for Supabase stack
cat > docker-compose.yml <<'DOCKEREOF'
version: '3.8'

services:
  # PostgreSQL with pgvector
  postgres:
    image: supabase/postgres:15.1.0.147
    container_name: supabase-db
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_PASSWORD: $${POSTGRES_PASSWORD}
      POSTGRES_DB: postgres
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # PostgREST API
  postgrest:
    image: postgrest/postgrest:v11.2.2
    container_name: supabase-rest
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      PGRST_DB_URI: postgres://postgres:$${POSTGRES_PASSWORD}@postgres:5432/postgres
      PGRST_DB_SCHEMAS: public,storage,graphql_public
      PGRST_DB_ANON_ROLE: anon
      PGRST_JWT_SECRET: $${JWT_SECRET}
      PGRST_DB_USE_LEGACY_GUCS: "false"

  # GoTrue (Auth)
  gotrue:
    image: supabase/gotrue:v2.132.3
    container_name: supabase-auth
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      GOTRUE_API_HOST: 0.0.0.0
      GOTRUE_API_PORT: 9999
      API_EXTERNAL_URL: http://localhost
      GOTRUE_DB_DRIVER: postgres
      GOTRUE_DB_DATABASE_URL: postgres://supabase_auth_admin:$${POSTGRES_PASSWORD}@postgres:5432/postgres
      GOTRUE_SITE_URL: http://localhost
      GOTRUE_URI_ALLOW_LIST: "*"
      GOTRUE_DISABLE_SIGNUP: "false"
      GOTRUE_JWT_ADMIN_ROLES: service_role
      GOTRUE_JWT_AUD: authenticated
      GOTRUE_JWT_DEFAULT_GROUP_NAME: authenticated
      GOTRUE_JWT_EXP: 3600
      GOTRUE_JWT_SECRET: $${JWT_SECRET}
      GOTRUE_EXTERNAL_EMAIL_ENABLED: "true"
      GOTRUE_MAILER_AUTOCONFIRM: "true"

  # Realtime
  realtime:
    image: supabase/realtime:v2.25.35
    container_name: supabase-realtime
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: postgres
      DB_USER: supabase_admin
      DB_PASSWORD: $${POSTGRES_PASSWORD}
      DB_SSL: "false"
      PORT: 4000
      JWT_SECRET: $${JWT_SECRET}
      REPLICATION_MODE: RLS
      REPLICATION_POLL_INTERVAL: 100
      SECURE_CHANNELS: "true"
      SLOT_NAME: supabase_realtime_rls
      TEMPORARY_SLOT: "true"

  # Storage
  storage:
    image: supabase/storage-api:v0.46.4
    container_name: supabase-storage
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      ANON_KEY: $${ANON_KEY}
      SERVICE_KEY: $${SERVICE_ROLE_KEY}
      POSTGREST_URL: http://postgrest:3000
      PGRST_JWT_SECRET: $${JWT_SECRET}
      DATABASE_URL: postgres://supabase_storage_admin:$${POSTGRES_PASSWORD}@postgres:5432/postgres
      FILE_SIZE_LIMIT: 52428800
      STORAGE_BACKEND: file
      FILE_STORAGE_BACKEND_PATH: /var/lib/storage
      TENANT_ID: stub
      REGION: local
      GLOBAL_S3_BUCKET: stub
    volumes:
      - storage-data:/var/lib/storage

  # Kong (API Gateway)
  kong:
    image: kong:3.4.2
    container_name: supabase-kong
    restart: unless-stopped
    ports:
      - "80:8000"
      - "443:8443"
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /usr/local/kong/kong.yml
      KONG_DNS_ORDER: LAST,A,CNAME
      KONG_PLUGINS: request-transformer,cors,key-auth,acl
    volumes:
      - ./kong.yml:/usr/local/kong/kong.yml

  # Supabase Studio
  studio:
    image: supabase/studio:20240101-ce42139
    container_name: supabase-studio
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      STUDIO_PG_META_URL: http://meta:8080
      POSTGRES_PASSWORD: $${POSTGRES_PASSWORD}
      DEFAULT_ORGANIZATION_NAME: "QCKSTRT"
      DEFAULT_PROJECT_NAME: "${project}-${stage}"
      SUPABASE_URL: http://kong:8000
      SUPABASE_PUBLIC_URL: http://localhost
      SUPABASE_ANON_KEY: $${ANON_KEY}
      SUPABASE_SERVICE_KEY: $${SERVICE_ROLE_KEY}

  # Meta (for Studio)
  meta:
    image: supabase/postgres-meta:v0.75.0
    container_name: supabase-meta
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      PG_META_PORT: 8080
      PG_META_DB_HOST: postgres
      PG_META_DB_PORT: 5432
      PG_META_DB_NAME: postgres
      PG_META_DB_USER: postgres
      PG_META_DB_PASSWORD: $${POSTGRES_PASSWORD}

  # Redis (for caching)
  redis:
    image: redis:7-alpine
    container_name: redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes

  # ChromaDB (vector database)
  chromadb:
    image: chromadb/chroma:latest
    container_name: chromadb
    restart: unless-stopped
    ports:
      - "8001:8000"
    volumes:
      - chroma-data:/chroma/chroma
    environment:
      ANONYMIZED_TELEMETRY: "false"
      ALLOW_RESET: "true"

volumes:
  postgres-data:
  storage-data:
  redis-data:
  chroma-data:
DOCKEREOF

# Create Kong configuration
cat > kong.yml <<'KONGEOF'
_format_version: "3.0"

services:
  - name: auth-v1
    url: http://gotrue:9999/
    routes:
      - name: auth-v1-all
        strip_path: true
        paths:
          - /auth/v1/

  - name: rest-v1
    url: http://postgrest:3000/
    routes:
      - name: rest-v1-all
        strip_path: true
        paths:
          - /rest/v1/

  - name: realtime-v1
    url: http://realtime:4000/
    routes:
      - name: realtime-v1-all
        strip_path: true
        paths:
          - /realtime/v1/

  - name: storage-v1
    url: http://storage:5000/
    routes:
      - name: storage-v1-all
        strip_path: true
        paths:
          - /storage/v1/

  - name: meta
    url: http://meta:8080/
    routes:
      - name: meta-all
        strip_path: true
        paths:
          - /pg/

plugins:
  - name: cors
    config:
      origins:
        - "*"
      methods:
        - GET
        - POST
        - PUT
        - PATCH
        - DELETE
        - OPTIONS
      headers:
        - Accept
        - Accept-Version
        - Content-Length
        - Content-MD5
        - Content-Type
        - Date
        - X-Auth-Token
        - Authorization
        - apikey
      exposed_headers:
        - X-Auth-Token
      credentials: true
      max_age: 3600
KONGEOF

# Create init scripts directory
mkdir -p init-scripts

# Create database initialization script
cat > init-scripts/01-init.sql <<'SQLEOF'
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create necessary roles
CREATE ROLE anon NOLOGIN NOINHERIT;
CREATE ROLE authenticated NOLOGIN NOINHERIT;
CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
CREATE ROLE supabase_auth_admin NOLOGIN NOINHERIT;
CREATE ROLE supabase_storage_admin NOLOGIN NOINHERIT;
CREATE ROLE supabase_admin NOLOGIN NOINHERIT;

-- Grant necessary permissions
GRANT anon TO postgres;
GRANT authenticated TO postgres;
GRANT service_role TO postgres;
GRANT supabase_auth_admin TO postgres;
GRANT supabase_storage_admin TO postgres;
GRANT supabase_admin TO postgres;

-- Create auth schema
CREATE SCHEMA IF NOT EXISTS auth;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;

-- Create storage schema
CREATE SCHEMA IF NOT EXISTS storage;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
SQLEOF

# Create .env file
cat > .env <<ENVEOF
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
JWT_SECRET=$JWT_SECRET
ANON_KEY=$ANON_KEY
SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY
GPU_SERVER_IP=${gpu_server_ip}
ENVEOF

# Set proper ownership
chown -R ubuntu:ubuntu /opt/qckstrt

# Start all services
cd /opt/qckstrt
docker-compose up -d

# Wait for PostgreSQL to be healthy
echo "Waiting for PostgreSQL to be ready..."
sleep 30

echo "=========================================="
echo "QCKSTRT App Server Setup Complete!"
echo "=========================================="
echo ""
echo "Supabase Studio: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"
echo "Supabase API: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "ChromaDB: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8001"
echo ""
echo "GPU Server: ${gpu_server_ip}"
