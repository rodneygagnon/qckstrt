# QCKSTRT
A NextJs / NestJs Full Stack project complete with AWS infrastructure.

## Prerequisites
- pnpm 
- AWS Account

## Frontend ([README.md](/apps/frontend/README.md))
- [Next.js](https://nextjs.org) - React Web Framework
- [React](https://react.dev) - Web UI Framework
- [TailwindCSS](https://tailwindcss.com) - CSS Framework
- [Cypress](https://www.cypress.io) - E2E / Component Testing
- [Jest](https://jestjs.io) - Unit Testing

## Backend ([README.md](/apps/backend/README.md))
- [Nest.js](https://nestjs.com) - Scalable Server-Side Node.js Framework
- [GraphQL](https://graphql.org) - Graph API
- [Jest](https://jestjs.io) - Unit Testing

## Infrastructure ([README.md](/infra/README.md))
- [Terraform](https://www.terraform.io) - AWS Cloud Formation
- [AWS IAM](https://aws.amazon.com/iam/) - (Internal) Identity and Access Management
- [AWS VPC](https://aws.amazon.com/vpc/) - Amazon Virtual Private Cloud
- [AWS ECR](https://aws.amazon.com/ecr/) - Amazon Elastic Container Registry
- [AWS EKS](https://aws.amazon.com/eks/) - Amazon Elastic Kubernetes Service
- [AWS Lambda](https://aws.amazon.com/lambda/) - Amazon Serverless Functions
- [AWS Fargate](https://aws.amazon.com/fargate/) - Amazon Serverless Compute
- [AWS CloudWatch](https://aws.amazon.com/cloudwatch/) - Amazon Cloud Watch Observability
- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) - Amazon Secrets Managmenent

## Containerization
- [Docker](https://www.docker.com) - Images & Containers
- [Kubernetes](https://kubernetes.io) - Container Orchestration

### AWS Services
- [AWS Cognito](https://aws.amazon.com/cognito/) - (End User) IAM, Attribute- & Role-Based Access Control
- [AWS S3](https://aws.amazon.com/s3/) - Amazon Cloud Storage
- [AWS SES](https://aws.amazon.com/ses/) - Amazon Simple Email Service
- [AWS RDS](https://aws.amazon.com/rds/) ([Aurora](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/CHAP_AuroraOverview.html))  - Relational Database Service

## Build Workspaces
```bash
pnpm --filter frontend build
pnpm --filter backend build
```

## *** Next Steps ***

### CI / CD
- [GitHub Actions](https://github.com/features/actions) - Automate AWS Cloud formation, build/push docker images, deploy containers

### Mobile Application
- [ReactNative](https://reactnative.dev) - Mobile UI iOS & Android