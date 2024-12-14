resource "random_string" "token" {
  for_each = toset(var.apiClients)

  length  = 32
  upper = true
  lower = true
  special = false
}

locals {
  secrets = {
    apiKeys = {
      for apiClient in var.apiClients : apiClient => random_string.token[apiClient].result
    },
    auth = {
      userPoolId = var.userPoolId
      clientId = var.userPoolClientId
    },
    file = {
      bucket = var.fileBucket
    },
    db = {
      connection = "remote",
      config = {
          type ="aurora-postgres",
          database = var.database,
          secretArn = var.database_secret,
          resourceArn = var.database_arn
      }
    }
  }
}

resource "aws_secretsmanager_secret" "secretmanager" {
  name = "${var.project}-${var.stage}-keys"
}

resource "aws_secretsmanager_secret_version" "config" {
  secret_id     = aws_secretsmanager_secret.secretmanager.id

  secret_string = jsonencode(local.secrets)

  lifecycle {
    ignore_changes = [secret_string]
  }
}