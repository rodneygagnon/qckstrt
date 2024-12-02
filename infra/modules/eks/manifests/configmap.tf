resource "kubectl_manifest" "configmap" {
  yaml_body = <<-YAML
    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: ${var.namespace}
      namespace: ${var.namespace}
    data:
      PROJECT: 'qckstrt'
      NODE_ENV: 'dev'

      # WWW
      APP_PORT: '3000'

      # GraphQL API Gateway
      API_PORT: '3001'
      API_APPLICATION: 'api'
      API_VERSION: '0.0.1'
      API_DESCRIPTION: 'API Gateway'
      API_MICROSERVICES: '[{ "name": "users", "url": "http://nestjs-users:8080/graphql" },{ "name": "posts", "url": "http://nestjs-posts:8080/graphql" }]'

      # GraphQL User Microservice
      USERS_PORT: '3002'
      USERS_APPLICATION: 'users'
      USERS_VERSION: '0.0.1'
      USERS_DESCRIPTION: 'Users Microservice'

      # GraphQL Post Microservice
      POSTS_PORT: '3003'
      POSTS_APPLICATION: 'posts'
      POSTS_VERSION: '0.0.1'
      POSTS_DESCRIPTION: 'Posts Microservice'
YAML
}
