variable "project" {
  type        = string
  description = "infrastructure project name"
}

variable "stage" {
  type        = string
  description = "infrastructure stage (ex. dev, stg, uat, prd, ...)"
}

variable "domain" {
  type = string
  description = "Domain name"
}