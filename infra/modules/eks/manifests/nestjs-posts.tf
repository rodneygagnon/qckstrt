# NESTJS Posts Microservice
resource "kubectl_manifest" "nestjs_posts_deployment" {
  yaml_body = <<-YAML
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: nestjs-posts
      namespace: ${var.namespace}
      labels:
        app: nestjs-posts
        node: fargate
        env: "${var.project}-${var.stage}"
        project: "${var.project}-${var.stage}-posts"
        version: v1
    spec:
      replicas: 2
      selector:
        matchLabels:
          app: nestjs-posts
      template:
        metadata:
          labels:
            app: nestjs-posts
            node: fargate
        spec:
          containers:
          - name: nestjs-posts-container
            image: "${local.ecr_reg}/${var.project}-${var.stage}-posts:latest"
            env:
              - name: PORT
                value: "8080"
              - name: PROJECT
                valueFrom:
                  configMapKeyRef:
                    name: ${var.namespace}
                    key: PROJECT
              - name: APPLICATION
                valueFrom:
                  configMapKeyRef:
                    name: ${var.namespace}
                    key: POSTS_APPLICATION
              - name: VERSION
                valueFrom:
                  configMapKeyRef:
                    name: ${var.namespace}
                    key: POSTS_VERSION
              - name: DESCRIPTION
                valueFrom:
                  configMapKeyRef:
                    name: ${var.namespace}
                    key: POSTS_DESCRIPTION
            ports:
              - containerPort: 8080
                protocol: TCP
          restartPolicy: Always
YAML
}

resource "kubectl_manifest" "nestjs_posts_service" {
  yaml_body = <<-YAML
    apiVersion: v1
    kind: Service
    metadata:
      name: nestjs-posts
      namespace: ${var.namespace}
      labels:
        app: nestjs-posts
        env: ${var.namespace}
        node: fargate
        project: "${var.project}-${var.stage}-posts"
        version: v1
    spec:
      type: NodePort
      selector:
        app: nestjs-posts
      ports:
        - name: "8080"
          port: 8080
          targetPort: 8080
YAML
}

