# NESTJS Users Microservice
resource "kubectl_manifest" "nestjs_users_deployment" {
  yaml_body = <<-YAML
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: nestjs-users
      namespace: ${var.namespace}
      labels:
        app: nestjs-users
        node: fargate
        env: "${var.project}-${var.stage}"
        project: "${var.project}-${var.stage}-users"
        version: v1
    spec:
      replicas: 2
      selector:
        matchLabels:
          app: nestjs-users
      template:
        metadata:
          labels:
            app: nestjs-users
            node: fargate
        spec:
          containers:
          - name: nestjs-users-container
            image: "${local.ecr_reg}/${var.project}-${var.stage}-users:latest"
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
                    key: USERS_APPLICATION
              - name: VERSION
                valueFrom:
                  configMapKeyRef:
                    name: ${var.namespace}
                    key: USERS_VERSION
              - name: DESCRIPTION
                valueFrom:
                  configMapKeyRef:
                    name: ${var.namespace}
                    key: USERS_DESCRIPTION
            ports:
              - containerPort: 8080
                protocol: TCP
          restartPolicy: Always
YAML
}

resource "kubectl_manifest" "nestjs_users_service" {
  yaml_body = <<-YAML
    apiVersion: v1
    kind: Service
    metadata:
      name: nestjs-users
      namespace: ${var.namespace}
      labels:
        app: nestjs-users
        env: ${var.namespace}
        node: fargate
        project: "${var.project}-${var.stage}-users"
        version: v1
    spec:
      type: NodePort
      selector:
        app: nestjs-users
      ports:
        - name: "8080"
          port: 8080
          targetPort: 8080
YAML
}

