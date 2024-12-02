resource "helm_release" "aws_load_balancer_controller" {
  name = "${var.project}-${var.stage}-alb"

  repository = "https://aws.github.io/eks-charts"
  chart      = "aws-load-balancer-controller"
  namespace  = "kube-system"
  version    = "1.5.3"

  set {
    name  = "clusterName"
    value = aws_eks_cluster.eks_cluster.id
  }

  set {
    name  = "replicaCount"
    value = 1
  }

  set {
    name  = "region"
    value = var.region
  }

  set {
    name  = "vpcId"
    value = var.vpc_id
  }

  set {
    name  = "serviceAccount.name"
    value = "aws-load-balancer-controller"
  }

  set {
    name  = "serviceAccount.annotations.eks\\.amazonaws\\.com/role-arn"
    value = aws_iam_role.aws_load_balancer_controller.arn
  }

  depends_on = [
    aws_eks_node_group.node_group,
    aws_iam_role_policy_attachment.aws_load_balancer_controller_attach
  ]
}
