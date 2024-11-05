# NEXTJS Web Server
resource "kubectl_manifest" "nextjs_deployment" {
  yaml_body = <<-YAML
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: nextjs-app
      namespace: ${var.namespace}
      labels:
        app: nextjs-app
        node: ec2
        env: "${var.project}-${var.stage}"
        project: "${var.project}-${var.stage}-nextjs"
        version: v1
    spec:
      replicas: 2
      selector:
        matchLabels:
          app: nextjs-app
      template:
        metadata:
          labels:
            app: nextjs-app
            node: ec2
        spec:
          containers:
          - name: nextjs-container
            image: "${local.ecr_reg}/${var.project}-${var.stage}-nextjs:latest"
            env:
              - name: PORT
                valueFrom:
                  configMapKeyRef:
                    name: ${var.namespace}
                    key: APP_PORT
            ports:
              - containerPort: 3000
                protocol: TCP
          restartPolicy: Always
YAML
}

resource "kubectl_manifest" "nextjs_service" {
  yaml_body = <<-YAML
    apiVersion: v1
    kind: Service
    metadata:
      name: nextjs-service
      namespace: ${var.namespace}
      labels:
        app: nextjs-app
        env: ${var.namespace}
        project: "${var.project}-${var.stage}-nextjs"
        version: v1
    spec:
      type: NodePort
      selector:
        app: nextjs-app
      ports:
        - name: "3000"
          port: 3000
          targetPort: 3000
YAML
}

