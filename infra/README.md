# QCKSTRT AWS Infrastructure

Simple, cost-effective AWS infrastructure for running QCKSTRT with self-hosted AI services.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              AWS VPC                                     │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────┐   │
│  │      App Server (t3.xlarge)     │  │   GPU Server (g5.xlarge)    │   │
│  │  ┌───────────────────────────┐  │  │  ┌───────────────────────┐  │   │
│  │  │     Supabase Stack        │  │  │  │    vLLM (port 8000)   │  │   │
│  │  │  - PostgreSQL + pgvector  │  │  │  │  Mistral-7B-Instruct  │  │   │
│  │  │  - Auth (GoTrue)          │  │  │  └───────────────────────┘  │   │
│  │  │  - Storage                │  │  │  ┌───────────────────────┐  │   │
│  │  │  - Realtime               │  │  │  │ Embeddings (port 8001)│  │   │
│  │  │  - Kong API Gateway       │  │  │  │   bge-large-en-v1.5   │  │   │
│  │  │  - Studio (port 3000)     │  │  │  └───────────────────────┘  │   │
│  │  └───────────────────────────┘  │  │                             │   │
│  │  ┌───────────────────────────┐  │  │         Spot Instance       │   │
│  │  │    Redis + ChromaDB       │  │  │        (cost savings)       │   │
│  │  └───────────────────────────┘  │  └─────────────────────────────┘   │
│  └─────────────────────────────────┘                                    │
└─────────────────────────────────────────────────────────────────────────┘
```

## Target Specifications

| Metric | Target |
|--------|--------|
| Users | 10-50k |
| Concurrent Requests | 100-500 |
| AI Queries/Month | 1M+ |
| Database Storage | 100GB+ |
| File Storage | TB+ |
| **Estimated Cost** | **$500-800/month** |

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Terraform** >= 1.0 installed
4. **SSH Key Pair** created in AWS EC2

### Create SSH Key Pair

```bash
# Create key pair and save private key
aws ec2 create-key-pair \
  --key-name qckstrt-key \
  --query 'KeyMaterial' \
  --output text > qckstrt-key.pem

# Set proper permissions
chmod 400 qckstrt-key.pem
```

## Quick Start

### 1. Configure Variables

```bash
# Copy the example file
cp project.tfvars.example terraform.tfvars

# Edit with your values
vi terraform.tfvars
```

Key variables to set:
- `ssh_key_name` - Your AWS SSH key pair name
- `allowed_ssh_cidr` - Your IP address (e.g., "203.0.113.50/32")
- `aws_profile` - Your AWS CLI profile (default: "default")
- `aws_region` - Target region (default: "us-east-1")

### 2. Deploy Infrastructure

```bash
# Initialize Terraform
make init

# Preview changes
make plan

# Deploy
make apply
```

### 3. Wait for Services

After deployment, wait **5-10 minutes** for services to start. Monitor with:

```bash
# View app server setup logs
make logs-app

# View GPU server setup logs
make logs-gpu
```

### 4. Verify Deployment

```bash
# Show all outputs
make outputs

# Check instance status
make status
```

## Services & URLs

After deployment, `make outputs` displays all service URLs:

| Service | Port | Description |
|---------|------|-------------|
| Supabase API | 80 | REST/GraphQL API |
| Supabase Studio | 3000 | Admin dashboard |
| ChromaDB | 8001 | Vector database |
| vLLM | 8000 | OpenAI-compatible LLM API |
| Embeddings | 8001 | Text embeddings API |

## Operations

### SSH Access

```bash
# SSH to app server
make ssh-app

# SSH to GPU server
make ssh-gpu
```

### View Logs

```bash
# App server setup logs
make logs-app

# GPU server setup logs
make logs-gpu
```

### Check Status

```bash
make status
```

## Instance Sizing Guide

### App Server

| Type | vCPU | RAM | Use Case |
|------|------|-----|----------|
| t3.xlarge | 4 | 16GB | 100-500 concurrent users (default) |
| t3.2xlarge | 8 | 32GB | 500-1000 concurrent users |
| m6i.2xlarge | 8 | 32GB | Production workloads |

### GPU Server

| Type | GPU | VRAM | Use Case |
|------|-----|------|----------|
| g5.xlarge | 1 | 24GB | 7B-13B models (default) |
| g5.2xlarge | 1 | 24GB | More CPU/RAM for batching |
| g5.4xlarge | 1 | 24GB | Heavy embeddings workloads |
| g5.12xlarge | 4 | 96GB | 70B models or high throughput |

## Backend Configuration

Use these environment variables for your QCKSTRT backend:

```bash
# Get from Terraform outputs
terraform output backend_env_vars
```

Example `.env`:
```bash
SUPABASE_URL=http://<app-server-ip>
VECTOR_DB_CHROMA_URL=http://<app-server-ip>:8001
LLM_URL=http://<gpu-server-ip>:8000
EMBEDDINGS_PROVIDER=ollama
EMBEDDINGS_OLLAMA_URL=http://<gpu-server-ip>:8001
RELATIONAL_DB_HOST=<app-server-ip>
RELATIONAL_DB_PORT=5432
```

## Cost Breakdown

| Resource | Type | Monthly Cost |
|----------|------|--------------|
| App Server | t3.xlarge (on-demand) | ~$120 |
| GPU Server | g5.xlarge (spot @ $0.40/hr avg) | ~$290 |
| EBS Storage | 400GB gp3 | ~$35 |
| Elastic IPs | 2 | ~$7 |
| Secrets Manager | 1 secret | ~$1 |
| **Total** | | **~$450-600/month** |

*Costs vary by region and spot pricing. GPU spot prices fluctuate between $0.30-0.60/hr.*

## Troubleshooting

### Services Not Starting

1. Check user-data logs:
   ```bash
   make ssh-app
   sudo tail -f /var/log/user-data.log
   ```

2. Check Docker containers:
   ```bash
   docker ps -a
   docker logs <container_name>
   ```

### Spot Instance Interrupted

Spot instances may be interrupted when AWS needs capacity. The instance is configured to **stop** (not terminate), so your data is preserved. Simply wait for it to restart or check AWS console.

### Cannot SSH

1. Verify `allowed_ssh_cidr` includes your IP
2. Check security group rules in AWS Console
3. Ensure SSH key permissions: `chmod 400 qckstrt-key.pem`

## Cleanup

```bash
# Destroy all resources
make destroy

# Clean local Terraform files
make clean
```

## Security Notes

1. **SSH/Admin Access**: `allowed_ssh_cidr` is **required** - you must set your IP (no default)
   ```bash
   # Find your IP
   curl -s https://ifconfig.me
   # Use format: "YOUR_IP/32"
   ```
2. **Supabase Studio**: Only accessible from your `allowed_ssh_cidr`
3. **Secrets**: Stored in AWS Secrets Manager, fetched securely at boot
4. **GPU Services**: Only accessible from app server (internal VPC traffic)
5. **No HTTPS by default**: For production, add an ALB with ACM certificate

## Monitoring

CloudWatch alarms are configured for:
- **CPU utilization** (>80% app, >90% GPU)
- **Instance status checks** (health failures)
- **Disk usage** (>85%, requires CloudWatch agent)
- **Spot interruption warnings** (2-minute notice via EventBridge)

To receive alerts, subscribe to the SNS topic:
```bash
# Get the SNS topic ARN
terraform output -raw alerts_sns_topic_arn

# Subscribe your email (do this in AWS Console or CLI)
aws sns subscribe --topic-arn <ARN> --protocol email --notification-endpoint your@email.com
```

## Files

| File | Description |
|------|-------------|
| `main.tf` | Terraform & provider configuration |
| `variables.tf` | Input variables |
| `data.tf` | Data sources (AMIs, availability zones) |
| `vpc.tf` | VPC, subnets, internet gateway, routes |
| `security-groups.tf` | Security groups and rules |
| `iam.tf` | IAM roles, policies, instance profile |
| `secrets.tf` | Secrets Manager and random passwords |
| `monitoring.tf` | CloudWatch alarms and SNS alerts |
| `app-server.tf` | Application server EC2 instance |
| `gpu-server.tf` | GPU spot instance for AI inference |
| `outputs.tf` | Terraform outputs |
| `project.tfvars.example` | Example variables file |
| `Makefile` | Convenience commands |
| `scripts/app-server.sh` | App server bootstrap script |
| `scripts/gpu-server.sh` | GPU server bootstrap script |
