variable "project" {
  type        = string
  description = "infrastructure project name"
}

variable "stage" {
  type        = string
  description = "infrastructure stage (ex. dev, stg, uat, prd, ...)"
}

variable "secrets" {
  type = object({
    organizations_port      = number
    persons_port            = number
    roles_port              = number
    api_key                 = string
    enc_alg                 = string
  })
  description = "service configuration"
}
