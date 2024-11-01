# Data Sources
data "aws_route53_zone" "domain_zone" {
  name = var.domain
}

data "tls_certificate" "tls_cert" {
  url = aws_eks_cluster.eks_cluster.identity[0].oidc[0].issuer
}

