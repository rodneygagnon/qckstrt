# =============================================================================
# Variables
# =============================================================================

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "aws_profile" {
  description = "AWS CLI profile to use"
  type        = string
  default     = "default"
}

variable "project" {
  description = "Project name"
  type        = string
  default     = "qckstrt"
}

variable "stage" {
  description = "Deployment stage (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "ssh_key_name" {
  description = "Name of the SSH key pair in AWS"
  type        = string
}

variable "allowed_ssh_cidr" {
  description = "CIDR block allowed for SSH access (restrict to your IP)"
  type        = string
  default     = "0.0.0.0/0"  # Change to your IP/32 in production
}

variable "app_server_instance_type" {
  description = "Instance type for application server"
  type        = string
  default     = "t3.xlarge"  # 4 vCPU, 16GB RAM
}

variable "gpu_server_instance_type" {
  description = "Instance type for GPU server"
  type        = string
  default     = "g5.xlarge"  # 1 GPU, 4 vCPU, 16GB RAM
}

variable "gpu_spot_max_price" {
  description = "Maximum spot price for GPU instance (on-demand is ~$1.00)"
  type        = string
  default     = "0.60"
}

variable "app_server_volume_size" {
  description = "Root volume size for app server (GB)"
  type        = number
  default     = 200
}

variable "gpu_server_volume_size" {
  description = "Root volume size for GPU server (GB)"
  type        = number
  default     = 200
}
