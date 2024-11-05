resource "kubectl_manifest" "ingress" {
  yaml_body = <<-YAML
    apiVersion: networking.k8s.io/v1
    kind: Ingress
    metadata:
      name: ${var.fqdn}
      namespace: ${var.namespace}
      labels:
        app: ${var.fqdn}
      annotations:
        alb.ingress.kubernetes.io/certificate-arn: ${var.certificate_arn}
        alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS":443}]'
        alb.ingress.kubernetes.io/ssl-redirect: '443'
        alb.ingress.kubernetes.io/scheme: internet-facing
        # alb.ingress.kubernetes.io/target-type: ip
        # alb.ingress.kubernetes.io/healthcheck-protocol: HTTP
        # alb.ingress.kubernetes.io/healthcheck-port: traffic-port
        # alb.ingress.kubernetes.io/healthcheck-interval-seconds: '15'
        # alb.ingress.kubernetes.io/healthcheck-timeout-seconds: '5'
        # alb.ingress.kubernetes.io/success-codes: '200'
        # alb.ingress.kubernetes.io/healthy-threshold-count: '2'
        # alb.ingress.kubernetes.io/unhealthy-threshold-count: '2'
    spec:
      ingressClassName: alb
      rules:
        - host: ${var.fqdn}
          http:
            paths:
              - path: /
                pathType: Prefix
                backend:
                  service:
                    name: nextjs-service
                    port:
                      number: 3000
              - path: /api
                pathType: Prefix
                backend:
                  service:
                    name: nestjs-api
                    port:
                      number: 8080
YAML
}