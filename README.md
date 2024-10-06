# QCKSTRT
A NextJs / NestJs Full Stack project complete with AWS infrastructure.

## Prerequisites
- pnpm 
- AWS Account

## Frontend ([README.md](/apps/frontend/README.md))
- [Next.js](https://nextjs.org) - React Web Framework
- [Nginx](https://nginx.org) - HTTP Server / Reverse Proxy / TLS Termination
- [React](https://react.dev) - Web UI Framework
- [TailwindCSS](https://tailwindcss.com) - CSS Framework
- [Cypress](https://www.cypress.io) - E2E / Component Testing
- [Jest](https://jestjs.io) - Unit Testing

## Backend ([README.md](/apps/backend/README.md))
- [Nest.js](https://nestjs.com) - Scalable Server-Side Node.js Framework
- [Jest](https://jestjs.io) - Unit Testing

## Infrastructure ([README.md](/infra/README.md))
- [Terraform](https://www.terraform.io) - AWS Cloud Formation
- [AWS VPC](https://aws.amazon.com/vpc/) - Amazon Virtual Private Cloud
- [AWS ECR](https://aws.amazon.com/ecr/) - Amazon Elastic Container Registry
- [AWS EKS](https://aws.amazon.com/eks/) - Amazon Elastic Kubernetes Service
- [AWS API Gateway](https://aws.amazon.com/api-gateway/) - Amazon API Management
- [AWS Lambda](https://aws.amazon.com/lambda/) - Amazon Serverless Functions
- [AWS S3](https://aws.amazon.com/s3/) - Amazon Cloud Storage
- [AWS CloudWatch](https://aws.amazon.com/cloudwatch/) - Amazon Cloud Watch Observability

## Containerization
- [Docker](https://www.docker.com) - Images & Containers
- [Kubernetes](https://kubernetes.io) - Container Orchestration

## Build Workspaces
```bash
pnpm --filter frontend build
pnpm --filter backend build
```

## *** Next Steps ***

### CI / CD
- [GitHub Actions](https://github.com/features/actions) - Automate AWS Cloud formation, build/push docker images, deploy containers

### AWS Services
 - [AWS Cognito](https://aws.amazon.com/cognito/) - Attribute- & Role-Based Access Control
- [AWS DynamoDB](https://aws.amazon.com/dynamodb/) - NoSQL DB
- [AWS Neptune](https://aws.amazon.com/neptune/) - Graph / Vector DB

### Open Source Alternatives (TBD)
 - [Keycloak](https://www.keycloak.org) - Attribute- & Role-Based Access Control
- [Redis](https://redis.io) - NoSQL DB
- [Neo4J](https://neo4j.com) - Graph / Vector DB (TBD Neptune Alternative)

### Mobile Application
- [ReactNative](https://reactnative.dev) - Mobile UI iOS & Android