# EKS Cluster Roles and Policies
resource "aws_iam_role" "eks_cluster_role" {
  name = "${var.project}-${var.stage}-cluster-role"
  description = "Allow cluster to manage node groups and cloudwatch logs"

  assume_role_policy = jsonencode({
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = [
          "eks.amazonaws.com"
        ]
      }
    }]
    Version = "2012-10-17"
  })
}

resource "aws_iam_role_policy_attachment" "AmazonEKSClusterPolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_cluster_role.name
}

resource "aws_iam_role_policy_attachment" "AmazonEKSVPCResourceController" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSVPCResourceController"
  role       = aws_iam_role.eks_cluster_role.name
}

# EKS Cluster Fargate Roles and Policies
resource "aws_iam_role" "eks_fargate_role" {
  name = "${var.project}-${var.stage}-fargate-role"
  description = "Allow cluster to manage node groups, fargate nodes and cloudwatch logs"

  assume_role_policy = jsonencode({
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = [
          "eks-fargate-pods.amazonaws.com"
        ]
      }
    }]
    Version = "2012-10-17"
  })
}

resource "aws_iam_role_policy_attachment" "AmazonEKSFargatePodExecutionRolePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSFargatePodExecutionRolePolicy"
  role       = aws_iam_role.eks_fargate_role.name
}

# EKS Cluster Node Group Roles and Policies
resource "aws_iam_role" "node_group_iam_role" {
  name = "eks-node-group-role"

  assume_role_policy = jsonencode({
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
    Version = "2012-10-17"
  })
}

resource "aws_iam_role_policy_attachment" "AmazonEKSWorkerNodePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.node_group_iam_role.name
}

resource "aws_iam_role_policy_attachment" "AmazonEKS_CNI_Policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.node_group_iam_role.name
}

resource "aws_iam_role_policy_attachment" "AmazonEC2ContainerRegistryReadOnly" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.node_group_iam_role.name
}

resource "aws_iam_openid_connect_provider" "eks_oidc_provider" {
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.tls_cert.certificates[0].sha1_fingerprint]
  url             = data.tls_certificate.tls_cert.url
}

data "aws_iam_policy_document" "assume_role_policy" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    effect  = "Allow"

    condition {
      test     = "StringEquals"
      variable = "${replace(aws_iam_openid_connect_provider.eks_oidc_provider.url, "https://", "")}:sub"
      values   = ["system:serviceaccount:kube-system:aws-node"]
    }

    principals {
      identifiers = [aws_iam_openid_connect_provider.eks_oidc_provider.arn]
      type        = "Federated"
    }
  }
}

resource "aws_iam_role" "vpc_cni_role" {
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json
  name                = "${var.project}-${var.stage}-vpc-cni-role"
}

resource "aws_iam_role_policy_attachment" "vpc_cni_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.vpc_cni_role.name
}

### AWS Load Balancer Policies & Roles
resource "aws_iam_policy" "aws_load_balancer_controller" {
  policy = file("${path.module}/policies/AWSLoadBalancerController.json")
  name   = "${var.project}-${var.stage}-alb-policy"
}

data "aws_iam_policy_document" "aws_load_balancer_controller_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    effect  = "Allow"

    condition {
      test     = "StringEquals"
      variable = "${replace(aws_iam_openid_connect_provider.eks_oidc_provider.url, "https://", "")}:sub"
      values   = ["system:serviceaccount:kube-system:aws-load-balancer-controller"]
    }

    principals {
      identifiers = [ aws_iam_openid_connect_provider.eks_oidc_provider.arn ]
      type        = "Federated"
    }
  }
}

resource "aws_iam_role" "aws_load_balancer_controller" {
  assume_role_policy = data.aws_iam_policy_document.aws_load_balancer_controller_assume_role_policy.json
  name                = "${var.project}-${var.stage}-alb-role"
}

resource "aws_iam_role_policy_attachment" "aws_load_balancer_controller_attach" {
  role       = aws_iam_role.aws_load_balancer_controller.name
  policy_arn = aws_iam_policy.aws_load_balancer_controller.arn
}

### Load Route53 Policies & Roles

# External DNS Access
resource "aws_iam_policy" "route53_zone_policy" {
  name   = "${var.project}-${var.stage}-route53-policy"
  policy = jsonencode({
    Statement = [
      {
        Action = [
          "route53:ChangeResourceRecordSets"
        ]
        Effect   = "Allow",
        Resource = "arn:aws:route53:::hostedzone/${data.aws_route53_zone.domain_zone.id}",
      },
      {
        Action = [
          "route53:ListHostedZones",
          "route53:ListResourceRecordSets"
        ],
        Effect = "Allow",
        Resource = [
          "*",
        ]
      },
    ]
    Version = "2012-10-17",
  })
}

data "aws_iam_policy_document" "route53_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    effect  = "Allow"

    condition {
      test     = "StringEquals"
      variable = "${replace(aws_iam_openid_connect_provider.eks_oidc_provider.url, "https://", "")}:sub"
      values   = [ "system:serviceaccount:kube-system:external-dns" ]
    }

    principals {
      identifiers = [ aws_iam_openid_connect_provider.eks_oidc_provider.arn ]
      type        = "Federated"
    }
  }
}

resource "aws_iam_role" "route53_zone_controller" {
  assume_role_policy  = data.aws_iam_policy_document.route53_assume_role_policy.json
  name                = "${var.project}-${var.stage}-route53-role"
}

resource "aws_iam_role_policy_attachment" "route53_zone_controller_attach" {
  role       = aws_iam_role.route53_zone_controller.name
  policy_arn = aws_iam_policy.route53_zone_policy.arn
}
