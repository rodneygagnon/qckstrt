variable "project" {
  type        = string
  description = "infrastructure project name"
}

variable "stage" {
  type        = string
  description = "infrastructure stage (ex. dev, stg, uat, prd, ...)"
}

variable "repositories" {
  type = map(object({
    image_tag_mutability    = string
    scan_on_push            = bool
    expiration_after_days   = number
    base_dir                = string
    dockerfile              = string
    platform                = string
    image_tag               = string
  }))
}
