# NESTJS Posts Microservice
resource "kubectl_manifest" "nestjs_files_deployment" {
  yaml_body = <<-YAML
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: nestjs-files
      namespace: ${var.namespace}
      labels:
        app: nestjs-files
        node: fargate
        env: "${var.project}-${var.stage}"
        project: "${var.project}-${var.stage}-files"
        version: v1
    spec:
      replicas: 2
      selector:
        matchLabels:
          app: nestjs-files
      template:
        metadata:
          labels:
            app: nestjs-files
            node: fargate
        spec:
          containers:
          - name: nestjs-files-container
            image: "${local.ecr_reg}/${var.project}-${var.stage}-files:latest"
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
                    key: FILES_APPLICATION
              - name: VERSION
                valueFrom:
                  configMapKeyRef:
                    name: ${var.namespace}
                    key: FILES_VERSION
              - name: DESCRIPTION
                valueFrom:
                  configMapKeyRef:
                    name: ${var.namespace}
                    key: FILES_DESCRIPTION
            ports:
              - containerPort: 8080
                protocol: TCP
          restartPolicy: Always
YAML
}

resource "kubectl_manifest" "nestjs_files_service" {
  yaml_body = <<-YAML
    apiVersion: v1
    kind: Service
    metadata:
      name: nestjs-files
      namespace: ${var.namespace}
      labels:
        app: nestjs-files
        env: ${var.namespace}
        node: fargate
        project: "${var.project}-${var.stage}-files"
        version: v1
    spec:
      type: NodePort
      selector:
        app: nestjs-files
      ports:
        - name: "8080"
          port: 8080
          targetPort: 8080
YAML
}

