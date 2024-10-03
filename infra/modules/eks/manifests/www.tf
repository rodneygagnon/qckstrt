# Secure WWW Service (TLS terminates at ALB)
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

locals {
  account = data.aws_caller_identity.current.account_id
  region = data.aws_region.current.name

  www-fqdn = "www.${var.domain}"

  ecr_reg = "${local.account}.dkr.ecr.${local.region}.amazonaws.com"

  www-namespace = "${var.project}-${var.stage}-www"
  nextjs-image = "${local.ecr_reg}/${var.project}-${var.stage}-nextjs:latest"
}

# Create a validated certificate
data "aws_route53_zone" "www-domain-zone" {
  name = var.domain
}

resource "aws_acm_certificate" "www-certificate" {
  domain_name       = local.www-fqdn
  validation_method = "DNS"
  lifecycle {
    create_before_destroy = true
  }
}

# Create a DNS record for the certificate validation
resource "aws_route53_record" "www-validation" {
  for_each = {
    for dvo in aws_acm_certificate.www-certificate.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.www-domain-zone.zone_id
}

# Validate the certificate
resource "aws_acm_certificate_validation" "www-certificate-validation" {
  certificate_arn = aws_acm_certificate.www-certificate.arn
  validation_record_fqdns = [ for record in aws_route53_record.www-validation : record.fqdn ]
  timeouts {
    create = "5m"
  }
}

resource "kubectl_manifest" "www-namespace" {
  yaml_body = <<-YAML
    apiVersion: v1
    kind: Namespace
    metadata:
      name: ${local.www-namespace}
YAML
}

# NEXTJS Web Server
resource "kubectl_manifest" "nextjs-deployment" {
  yaml_body = <<-YAML
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: nextjs
      namespace: ${local.www-namespace}
      labels:
        app: nextjs
        env: ${local.www-namespace}
        project: "${var.project}-${var.stage}-nextjs"
        version: v1
    spec:
      replicas: 1
      selector:
        matchLabels:
          app: nextjs
      template:
        metadata:
          labels:
            app: nextjs
        spec:
          containers:
          - name: nextjs
            image: ${local.nextjs-image}
            ports:
              - containerPort: 3000
                protocol: TCP
          restartPolicy: Always
YAML
}

resource "kubectl_manifest" "nextjs-service" {
  yaml_body = <<-YAML
    apiVersion: v1
    kind: Service
    metadata:
      name: nextjs
      namespace: ${local.www-namespace}
      labels:
        app: nextjs
        env: ${local.www-namespace}
        project: "${var.project}-${var.stage}-nextjs"
        version: v1
    spec:
      selector:
        app: nextjs
      type: NodePort
      ports:
        - name: "3000"
          port: 3000
          targetPort: 3000
YAML
}

resource "kubectl_manifest" "www-ingress" {
  yaml_body = <<-YAML
    apiVersion: networking.k8s.io/v1
    kind: Ingress
    metadata:
      name: ${local.www-fqdn}
      namespace: ${local.www-namespace}
      annotations:
        alb.ingress.kubernetes.io/certificate-arn: ${aws_acm_certificate.www-certificate.arn}
        alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS":443}]'
        alb.ingress.kubernetes.io/ssl-redirect: '443'
        alb.ingress.kubernetes.io/scheme: internet-facing
    spec:
      ingressClassName: alb
      rules:
        - host: ${local.www-fqdn}
          http:
            paths:
              - path: /
                pathType: Prefix
                backend:
                  service:
                    name: nextjs
                    port:
                      number: 3000
YAML
}