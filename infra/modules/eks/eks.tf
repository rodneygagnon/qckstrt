
locals {
  cluster_name = "${var.project}-${var.stage}-cluster"

  namespace = "${var.project}-${var.stage}-services"

  eks_addons = [
    {
      name    = "coredns"
      version = "v1.11.3-eksbuild.1"
    },
    {
      name    = "vpc-cni"
      version = "v1.18.5-eksbuild.1"
    },
    {
      name    = "kube-proxy"
      version = "v1.31.0-eksbuild.5"
    }
  ]
}

resource "aws_cloudwatch_log_group" "eks_cluster" {
  # The log group name format is /aws/eks/<cluster-name>/cluster
  # Reference: https://docs.aws.amazon.com/eks/latest/userguide/control-plane-logs.html
  name              = "/aws/eks/${local.cluster_name}/cluster"
  retention_in_days = 3

  # ... potentially other configuration ...
}

resource "aws_eks_cluster" "eks_cluster" {
  name     = local.cluster_name
  role_arn = aws_iam_role.eks_cluster_role.arn
  version = "1.31"

  vpc_config {
    subnet_ids               = concat(var.private_subnet_ids, var.public_subnet_ids)
    endpoint_private_access  = true
    endpoint_public_access   = true
    public_access_cidrs      = ["0.0.0.0/0"]
  }

  access_config {
    authentication_mode                         = "API_AND_CONFIG_MAP"
    bootstrap_cluster_creator_admin_permissions = true
  }

  enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]

  depends_on = [
    aws_cloudwatch_log_group.eks_cluster,
    aws_iam_role_policy_attachment.AmazonEKSClusterPolicy,
    aws_iam_role_policy_attachment.AmazonEKSVPCResourceController
  ]
}

# resource "aws_eks_addon" "eks_addons" {
#   for_each                = { for addon in local.eks_addons : addon.name => addon }
#   cluster_name            = local.cluster_name
#   addon_name              = each.value.name
#   addon_version           = each.value.version
#   resolve_conflicts_on_update = "OVERWRITE"

#   depends_on = [ aws_eks_cluster.eks_cluster ]
# }

# Allow pods to access AWS services outside of cluster (namespace)
# resource "aws_eks_addon" "eks-pod-identity-agent" {
#   cluster_name                = aws_eks_cluster.eks_cluster.name
#   addon_name                  = "eks-pod-identity-agent"
#   resolve_conflicts_on_update = "PRESERVE"
# }

resource "aws_eks_fargate_profile" "apps_fargate_profile" {
  cluster_name           = aws_eks_cluster.eks_cluster.name
  fargate_profile_name   = local.namespace
  pod_execution_role_arn = aws_iam_role.eks_fargate_role.arn

  subnet_ids = var.private_subnet_ids

  selector {
    namespace = local.namespace
    labels = {
      "node" = "fargate"
    }
  }
}

resource "aws_eks_node_group" "node_group" {
  cluster_name    = aws_eks_cluster.eks_cluster.name
  node_group_name = "${var.project}-${var.stage}-cluster-group"
  version         = aws_eks_cluster.eks_cluster.version
  node_role_arn   = aws_iam_role.node_group_iam_role.arn
  subnet_ids      = var.private_subnet_ids
  capacity_type   = "ON_DEMAND"
  disk_size       = var.eks_node_disk_size
  instance_types  = var.eks_node_instance_types

  labels = {
    "node": "ec2"
  }

  scaling_config {
    desired_size = var.eks_node_desired_size
    max_size     = var.eks_node_max_size
    min_size     = var.eks_node_min_size
  }

  update_config {
    max_unavailable = 1
  }

  depends_on = [
    aws_iam_role_policy_attachment.AmazonEKSWorkerNodePolicy,
    aws_iam_role_policy_attachment.AmazonEKS_CNI_Policy,
    aws_iam_role_policy_attachment.AmazonEC2ContainerRegistryReadOnly,
  ]
}

## Manifests
data "aws_eks_cluster_auth" "cluster_auth" {
  name = aws_eks_cluster.eks_cluster.name
}

module "eks_manifests" {
  source = "./manifests"

  project = var.project
  stage = var.stage

  region = var.region
  vpc_id = var.vpc_id

  fqdn = "www.${var.domain}"
  namespace = local.namespace

  certificate_arn = aws_acm_certificate.certificate.arn

  eks_role_arn = aws_iam_role.route53_zone_controller.arn
  eks_cluster_id = aws_eks_cluster.eks_cluster.id
  eks_cluster_endpoint = aws_eks_cluster.eks_cluster.endpoint
  eks_certificate_authority = aws_eks_cluster.eks_cluster.certificate_authority.0.data
  eks_cluster_auth_token = data.aws_eks_cluster_auth.cluster_auth.token
}