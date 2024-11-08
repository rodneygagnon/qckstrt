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

variable "apiClients" {
  type = list(string)
  description = "Registered API clients"
  default = [ "postman", "www", "mobile" ]
}