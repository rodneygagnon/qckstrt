variable "project" {
  type        = string
  description = "infrastructure project name"
}

variable "stage" {
  type        = string
  description = "infrastructure stage (ex. dev, stg, uat, prd, ...)"
}

variable "vpc_id" {
  type        = string
  description = "vpc id"
}

variable "subnet_ids" {
  type = list(string)
  description = "subnet ids to create cluster"
}
