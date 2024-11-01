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
  description = "(Required) Repository name"
}

variable "image_tag_mutability" {
  type = string
  description = "(Optional) The tag mutability setting for the repository. Must be one of: MUTABLE or IMMUTABLE. Defaults to MUTABLE"
  # default = "MUTABLE"
}

variable "scan_on_push" {
  type = bool
  description = "(Required) Indicates whether images are scanned after being pushed to the repository (true) or not scanned (false)."
  # default = true
}

variable "additional_tags" {
  type = map(string)
  description = "(Optional) A map of tags to assign to the resource."
  default = {}
}

variable "expiration_after_days" {
  type = number
  description = "(Optional) Delete images older than X days."
  # default = 5
}

variable "base_dir" {
  type = string
  description = "Base directory of the application"
}

variable "dockerfile" {
  type = string
  description = "Dockerfile of the application"
}

variable "image_tag" {
  type = string
  description = "Image tag for the repository"
}
