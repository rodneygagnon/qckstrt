data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

locals {
  account = data.aws_caller_identity.current.account_id
  region = data.aws_region.current.name

  ecr_reg = "${local.account}.dkr.ecr.${local.region}.amazonaws.com"
}

## Images
resource "docker_image" "image" {
  for_each = var.repositories

  name = "${local.ecr_reg}/${var.project}-${var.stage}-${each.key}"

  build {
    context = "${path.cwd}/../${each.value.base_dir}"
    tag     = ["${local.ecr_reg}/${var.project}-${var.stage}-${each.key}:${each.value.image_tag}"]

    dockerfile = each.value.dockerfile
    platform = each.value.platform
  }
}

resource "docker_registry_image" "registry_image" {
  for_each = var.repositories

  name          = docker_image.image[each.key].name
  keep_remotely = true
}
