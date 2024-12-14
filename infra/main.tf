# Main Terraform AWS Cloud Infrastructure

## VPC
module "vpc" {
  source = "./modules/vpc"
 
  project = var.project
  stage = var.stage

  vpc_cidr = var.vpc_cidr
  instance_tenancy = var.instance_tenancy
  enable_dns_support = var.enable_dns_support
  enable_dns_hostnames = var.enable_dns_hostnames

  map_public_ip_on_launch = var.map_public_ip_on_launch

  destination_cidr_block = var.destination_cidr_block

  public_subnet_ingress_nacls = var.public_subnet_ingress_nacls
  public_subnet_egress_nacls = var.public_subnet_egress_nacls
  private_subnet_ingress_nacls = var.private_subnet_ingress_nacls
  private_subnet_egress_nacls = var.private_subnet_egress_nacls

  domain_eip = var.domain_eip
  create_nat_gateway = var.create_nat_gateway
}

## ECR
module "ecr" {
  source = "./modules/ecr"
  for_each = var.repositories

  name = each.key

  image_tag_mutability = each.value.image_tag_mutability
  scan_on_push = each.value.scan_on_push
  expiration_after_days = each.value.expiration_after_days

  project = var.project
  stage = var.stage

  base_dir = each.value.base_dir
  dockerfile = each.value.dockerfile
  image_tag = each.value.image_tag
}

module "docker" {
  source = "./modules/docker"

  project = var.project
  stage = var.stage

  repositories = var.repositories
}

## SES
module "ses" {
  source = "./modules/ses"
 
  project = var.project
  stage = var.stage

  region = var.region

  domain = var.domain_name

  mail_from_subdomain = var.mail_from_subdomain
  email_identity = var.email_identity
}

## SES
module "cognito" {
  source = "./modules/cognito"
 
  project = var.project
  stage = var.stage

  region = var.region

  domain = var.domain_name

  email_identity = var.email_identity
  email_identity_source_arn = module.ses.email_identity_source_arn

  groups = var.groups
  schema_attributes = var.schema_attributes
}

module "secrets" {
  source = "./modules/secrets"

  project = var.project
  stage = var.stage

  userPoolId = module.cognito.userPoolId
}

module "s3" {
  source = "./modules/s3"

  project = var.project
  stage = var.stage
}

module "rds" {
  source = "./modules/rds"

  project = var.project
  stage = var.stage

  vpc_id = module.vpc.vpc_id
  subnet_ids = module.vpc.vpc_private_subnets
}

## EKS
# module "eks" {
#   source = "./modules/eks"
 
#   project = var.project
#   stage = var.stage

#   region = var.region

#   domain = var.domain_name
  
#   vpc_id = module.vpc.vpc_id
#   private_subnet_ids = module.vpc.vpc_private_subnets
#   public_subnet_ids = module.vpc.vpc_public_subnets

#   eks_node_instance_types = var.eks_node_instance_types
#   eks_node_disk_size = var.eks_node_disk_size
#   eks_node_min_size = var.eks_node_min_size
#   eks_node_max_size = var.eks_node_max_size
#   eks_node_desired_size = var.eks_node_desired_size
# }
