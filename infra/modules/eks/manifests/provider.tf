terraform {
  required_providers {
    kubectl = {
      source  = "gavinbunney/kubectl"
      version = "1.14.0"
    }
  }
}

provider "kubectl" {
  host                   = var.eks_cluster_endpoint
  cluster_ca_certificate = base64decode(var.eks_certificate_authority)
  load_config_file       = false
  token                  = var.eks_cluster_auth_token

  # exec {
  #   api_version = "client.authentication.k8s.io/v1beta1"
  #   args        = ["eks", "get-token", "--cluster-name", var.eks_cluster_id]
  #   command     = "aws"
  # }
}

provider "kubernetes" {
  config_path    = "~/.kube/config"
  # config_context = "my-context"
}

# resource "kubernetes_namespace" "example" {
#   metadata {
#     name = "my-first-namespace"
#   }
# }

# Secure WWW Service (TLS terminates at ALB)
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

locals {
  account = data.aws_caller_identity.current.account_id
  region = data.aws_region.current.name

  ecr_reg = "${local.account}.dkr.ecr.${local.region}.amazonaws.com"
}
