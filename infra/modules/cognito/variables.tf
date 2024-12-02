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

variable "alias_attributes" {
  type = list(string)
  description = "Attributes supported as an alias for this user pool"
  default = ["email"]
}
variable "username_attributes" {
  type = list(string)
  description = "Whether email addresses or phone numbers can be specified as usernames when a user signs up"
  default = ["email"]
}
variable "auto_verified_attributes" {
  type = list(string)
  description = "Attributes to be auto-verified"
  default = ["email"]
}

variable "password_minimum_length" {
  type = number
  description = "Minimum length of password"
  default = 8
}
variable "password_require_lowercase" {
  type = bool
  description = "Require a lowercase letter"
  default = true
}
variable "password_require_numbers" {
  type = bool
  description = "Require a number"
  default = true
}
variable "password_require_symbols" {
  type = bool
  description = "Require a symbol"
  default = true
}
variable "password_require_uppercase" {
  type = bool
  description = "Require a uppercase letter"
  default = true
}
variable "temporary_password_validity_days" {
  type = number
  description = "Temporary password validity days"
  default = 7
}
variable "email_identity" {
  type        = string
  description = "SES verified email"
}

variable "email_identity_source_arn" {
  type        = string
  description = "SES verified email identity arn"
}

variable "invite_email_subject" {
  type        = string
  description = "(Optional) The subject for email messages."
  default     = "Your new account."
}

variable "invite_email_message" {
  type        = string
  description = "(Optional) The message template for email messages. Must contain {username} and {####} placeholders, for username and temporary password, respectively."
  default     = "Your username is {username} and your temporary password is '{####}'."
}

variable "invite_sms_message" {
  type        = string
  description = "(Optional) The message template for SMS messages. Must contain {username} and {####} placeholders, for username and temporary password, respectively."
  default     = "Your username is {username} and your temporary password is '{####}'."
}

variable "groups" {
  description = "(Optional) A list of groups of a user pool."
  type        = any
  default = []
}

variable "schema_attributes" {
  description = "(Optional) A list of schema attributes of a user pool."
  type        = any
  default = []
}
