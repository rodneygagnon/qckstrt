variable "project" {
  type        = string
  description = "infrastructure project"
}
 
variable "stage" {
  type        = string
  description = "infrastructure environment"
}

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
