variable "profile" {
  type        = string
  description = "aws profile"
}

variable "project" {
  type        = string
  description = "infrastructure project name"
}

variable "stage" {
  type        = string
  description = "infrastructure stage (ex. dev, stg, uat, prd, ...)"
}

variable "domain_name" {
  type        = string
  description = "root domain name"
}

variable "mail_from_subdomain" {
  type        = string
  description = "mail from subdomain for SES"
}

variable "email_identity" {
  type        = string
  description = "email identity for SES"
}

variable region {
    type = string
    description = "the region this infrastructure is in"
}

# VPC Variables
variable "vpc_cidr" {
  type        = string
  description = "CIDR block for the VPC"
}

variable "instance_tenancy" {
  type        = string
  description = "Set instance-tenancy"
}

variable "enable_dns_support" {
  type        = bool
  description = "whether to enable DNS support or not"
}

variable "enable_dns_hostnames" {
  type        = bool
  description = "whether to enable DNS hostnames or not"
}

variable "domain_eip" {
  type        = string
  description = "Set the domain of eip"
}

variable "create_nat_gateway" {
  type        = bool
  description = "whether to create a NAT gateway or not"
}

variable "map_public_ip_on_launch" {
  type        = bool
  description = "whether to map public ip on launch or not"
}

variable "destination_cidr_block" {
  type        = string
  description = "Set the destination cidr block"
}

variable "public_subnet_ingress_nacls" {
  type = map(object({
    protocol   = string
    from_port  = number
    to_port    = number
    action     = string
    cidr_block = string
  }))
}

variable "public_subnet_egress_nacls" {
  type = map(object({
    protocol   = string
    from_port  = number
    to_port    = number
    action     = string
    cidr_block = string
  }))
}

variable "private_subnet_ingress_nacls" {
  type = map(object({
    protocol   = string
    from_port  = number
    to_port    = number
    action     = string
    cidr_block = string
  }))
}

variable "private_subnet_egress_nacls" {
  type = map(object({
    protocol   = string
    from_port  = number
    to_port    = number
    action     = string
    cidr_block = string
  }))
}

variable "repositories" {
  type = map(object({
    image_tag_mutability    = string
    scan_on_push            = bool
    expiration_after_days   = number
    base_dir                = string
    dockerfile              = string
    platform                = string
    image_tag               = string
  }))
}

variable "eks_node_instance_types" {
  type = list(string)
  description = "Cluster node types"
  # default = [ "t3-medium" ]
}

variable "eks_node_disk_size" {
  type        = number
}

variable "eks_node_min_size" {
  type        = number
}

variable "eks_node_max_size" {
  type        = number
}

variable "eks_node_desired_size" {
  type        = number
}