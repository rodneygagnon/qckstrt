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

variable "fileSQSUrl" {
  type        = string
  description = "AWS SQS Arn"
}

variable "fileSNSTopicArn" {
  type        = string
  description = "AWS SNS Topic Arn"
}

variable "fileSNSRoleArn" {
  type        = string
  description = "AWS SNS Role Arn"
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

variable "postgresql" {
  type = object({
    type                      = string
    host                      = string
    port                      = number
    database                  = string
    username                  = string
    password                  = string
  })
}

variable "openai" {
  type = object({
    apiKey                    = string
    gptModel                  = string
    embeddingModel            = string
    batchSize                 = number
    chunkSize                 = number
    chunkOverlap              = number
  })
}