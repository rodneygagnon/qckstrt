
resource "aws_eks_cluster" "eks_cluster" {
  name     = "${var.project}-${var.stage}-cluster"
  role_arn = aws_iam_role.cluster_role.arn
  version = "1.31"

  vpc_config {
    subnet_ids               = concat(var.private_subnet_ids, var.public_subnet_ids)
    endpoint_private_access  = true
    endpoint_public_access   = true
  }

  access_config {
    authentication_mode                         = "API_AND_CONFIG_MAP"
    bootstrap_cluster_creator_admin_permissions = true
  }

  depends_on = [
    aws_iam_role_policy_attachment.AmazonEKSClusterPolicy,
    aws_iam_role_policy_attachment.AmazonEKSVPCResourceController,
  ]
}

# Allow pods to access AWS services outside of cluster (namespace)
resource "aws_eks_addon" "eks-pod-identity-agent" {
  cluster_name                = aws_eks_cluster.eks_cluster.name
  addon_name                  = "eks-pod-identity-agent"
  resolve_conflicts_on_update = "PRESERVE"
}

resource "aws_eks_node_group" "node_group" {
  cluster_name    = aws_eks_cluster.eks_cluster.name
  node_group_name = "${var.project}-${var.stage}-cluster-group"
  version         = aws_eks_cluster.eks_cluster.version
  node_role_arn   = aws_iam_role.node-group-iam-role.arn
  subnet_ids      = var.private_subnet_ids
  capacity_type   = "ON_DEMAND"
  disk_size       = var.eks_node_disk_size
  instance_types  = var.eks_node_instance_types

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
# module "eks-manifests" {
#   source = "./manifests"

#   domain = var.domain

#   project = var.project
#   stage = var.stage

#   eks_role_arn = aws_iam_role.route53_zone_controller.arn
#   eks_cluster_id = aws_eks_cluster.eks_cluster.id
#   eks_cluster_endpoint = aws_eks_cluster.eks_cluster.endpoint
#   eks_certificate_authority = aws_eks_cluster.eks_cluster.certificate_authority.0.data
# }