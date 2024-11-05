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

variable "vpc_id" {
  type        = string
  description = "vpc id"
}


variable "namespace" {
  type        = string
  description = "Cluster namespace"
}

variable "eks_role_arn" {
  type        = string
  description = "eks role arn"
}

variable "eks_cluster_id" {
  type        = string
  description = "eks cluster id"
}

variable "eks_cluster_endpoint" {
  type        = string
  description = "eks cluster endpoint"
}

variable "eks_certificate_authority" {
  type        = string
  description = "eks cluster authority"
}

variable "eks_cluster_auth_token" {
  type        = string
  description = "eks cluster auth token"
}

variable "fqdn" {
  type = string
  description = "Fully Qualified Domain name"
}

variable "certificate_arn" {
  type        = string
  description = "fqdn tls cert arn"
}
