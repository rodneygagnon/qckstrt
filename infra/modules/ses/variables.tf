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

variable "mail_from_subdomain" {
  type = string
  description = "Mail From SubDomain name"
}

variable "email_identity" {
  type        = string
  description = "Email to use for SES."
}
