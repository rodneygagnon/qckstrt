
profile               = "rmg-west"
region                = "us-west-1"

# VPC Configuration
vpc_cidr              = "10.0.0.0/16"
instance_tenancy      = "default"
enable_dns_support    = true
enable_dns_hostnames  = true

domain_name           = "qckstrt.com"

# Elastic IP
domain_eip = "vpc"

# NAT Gateway
create_nat_gateway = true

# Subnets
map_public_ip_on_launch = true

# Route Table
destination_cidr_block = "0.0.0.0/0"

# Public Subnet NACLs
public_subnet_ingress_nacls = {
  "100" = {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    action      = "allow"
    cidr_block  = "0.0.0.0/0"
  }
}
public_subnet_egress_nacls = {
  "200" = {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    action      = "allow"
    cidr_block  = "0.0.0.0/0"
  }
}

# Private Subnet NACLs
private_subnet_ingress_nacls = {
  "100" = {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    action      = "allow"
    cidr_block  = "0.0.0.0/0"
  }
}
private_subnet_egress_nacls = {
  "200" = {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    action      = "allow"
    cidr_block  = "0.0.0.0/0"
  }
}

repositories = {
  "nextjs" = {
    image_tag_mutability = "MUTABLE",
    scan_on_push = true,
    expiration_after_days = 5,
    base_dir = "apps/frontend",
    dockerfile = "Dockerfile",
    platform = "linux/amd64",
    image_tag = "latest"
  },
  "organizations" = {
    image_tag_mutability = "MUTABLE",
    scan_on_push = true,
    expiration_after_days = 5,
    base_dir = "apps/backend",
    dockerfile = "docker/Dockerfile.organizations.aws",
    platform = "linux/amd64",
    image_tag = "latest"
  },
  # "persons" = {
  #   image_tag_mutability = "MUTABLE",
  #   scan_on_push = true,
  #   expiration_after_days = 5,
  #   base_dir = "apps/backend",
  #   dockerfile = "docker/Dockerfile.persons.aws",
  #   platform = "linux/amd64",
  #   image_tag = "latest"
  # },
  # "roles" = {
  #   image_tag_mutability = "MUTABLE",
  #   scan_on_push = true,
  #   expiration_after_days = 5,
  #   base_dir = "apps/backend",
  #   dockerfile = "docker/Dockerfile.roles.aws",
  #   platform = "linux/amd64",
  #   image_tag = "latest"
  # }
}

# API Lambda Services
lambdas = [ "organizations" ]

# Elastic Kubernetes Service
eks_node_instance_types   = [ "t3.medium" ]
eks_node_disk_size        = 20
eks_node_min_size         = 1
eks_node_max_size         = 2
eks_node_desired_size     = 1
