variable "project" {
  type        = string
  description = "infrastructure project"
}

variable "stage" {
  type        = string
  description = "infrastructure stage (ex. dev, stg, uat, prd, ...)"
}

variable "region" {
  type        = string
  description = "region"
}

variable "domain" {
  type = string
  description = "Domain name"
}

variable "vpc_id" {
  type        = string
  description = "vpc id"
}

variable "public_subnet_ids" {
  type = list(string)
  description = "subnet ids to create cluster"
}

variable "private_subnet_ids" {
  type = list(string)
  description = "subnet ids to create cluster"
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