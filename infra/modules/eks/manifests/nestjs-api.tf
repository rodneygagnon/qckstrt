# NESTJS API GraphQL Federation Service
resource "kubectl_manifest" "nestjs_api_deployment" {
  yaml_body = <<-YAML
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: nestjs-api
      namespace: ${var.namespace}
      labels:
        app: nestjs-api
        node: fargate
        env: "${var.project}-${var.stage}"
        project: "${var.project}-${var.stage}-api"
        version: v1
    spec:
      replicas: 2
      selector:
        matchLabels:
          app: nestjs-api
      template:
        metadata:
          labels:
            app: nestjs-api
            node: fargate
        spec:
          containers:
          - name: nestjs-api-container
            image: "${local.ecr_reg}/${var.project}-${var.stage}-api:latest"
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
                    key: API_APPLICATION
              - name: VERSION
                valueFrom:
                  configMapKeyRef:
                    name: ${var.namespace}
                    key: API_VERSION
              - name: DESCRIPTION
                valueFrom:
                  configMapKeyRef:
                    name: ${var.namespace}
                    key: API_DESCRIPTION
              - name: MICROSERVICES
                valueFrom:
                  configMapKeyRef:
                    name: ${var.namespace}
                    key: API_MICROSERVICES
            ports:
              - containerPort: 8080
                protocol: TCP
          restartPolicy: Always
YAML
}

resource "kubectl_manifest" "nestjs_api_service" {
  yaml_body = <<-YAML
    apiVersion: v1
    kind: Service
    metadata:
      name: nestjs-api
      namespace: ${var.namespace}
      labels:
        app: nestjs-api
        env: ${var.namespace}
        node: fargate
        project: "${var.project}-${var.stage}-api"
        version: v1
    spec:
      type: NodePort
      selector:
        app: nestjs-api
      ports:
        - name: "8080"
          port: 8080
          targetPort: 8080
YAML
}

