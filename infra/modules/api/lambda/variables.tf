variable "project" {
  type        = string
  description = "infrastructure project name"
}

variable "stage" {
  type        = string
  description = "infrastructure stage (ex. dev, stg, uat, prd, ...)"
}

variable "name" {
  type = string
  description = "(Required) Name of the function"
}

variable "gateway_id" {
  type = string
  description = "(Required) API Gateway Id"
}

variable "source_arn" {
  type = string
  description = "(Required) API Execution ARN"
}