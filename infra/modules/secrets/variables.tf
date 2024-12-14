variable "project" {
  type        = string
  description = "infrastructure project name"
}

variable "stage" {
  type        = string
  description = "infrastructure stage (ex. dev, stg, uat, prd, ...)"
}

variable "userPoolId" {
  type        = string
  description = "AWS Cognito User Pool"
}

variable "userPoolClientId" {
  type        = string
  description = "AWS Cognito User Pool Client Id"
}

variable "fileBucket" {
  type        = string
  description = "AWS S3 Bucket"
}

variable "database" {
  type        = string
  description = "AWS RDS Database Name"
}

variable "database_arn" {
  type        = string
  description = "AWS RDS Database ARN"
}

variable "database_secret" {
  type        = string
  description = "AWS RDS Database Secret ARN"
}

variable "apiClients" {
  type = list(string)
  description = "Registered API clients"
  default = [ "postman", "www", "mobile" ]
}