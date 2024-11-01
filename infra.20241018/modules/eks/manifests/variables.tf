variable "project" {
  type        = string
  description = "infrastructure project"
}

variable "stage" {
  type        = string
  description = "infrastructure stage (ex. dev, stg, uat, prd, ...)"
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

variable "domain" {
  type = string
  description = "Domain name"
}

