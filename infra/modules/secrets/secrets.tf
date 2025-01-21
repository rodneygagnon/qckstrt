resource "random_string" "token" {
  for_each = toset(var.apiClients)

  length  = 32
  upper = true
  lower = true
  special = false
}

locals {
  apiKeys = {
    for apiClient in var.apiClients : apiClient => random_string.token[apiClient].result
  }

  auth = {
    userPoolId = var.userPoolId
    clientId = var.userPoolClientId
  }

  file = {
    bucket = var.fileBucket
    sqsUrl = var.fileSQSUrl
    snsTopicArn = var.fileSNSTopicArn
    snsRoleArn = var.fileSNSRoleArn
  }

  remote_db = {
    connection = "remote",
    config = {
        type = "aurora-postgres",
        database = var.database,
        secretArn = var.database_secret,
        resourceArn = var.database_arn
    }
  }
  local_db = {
    connection = "local",
    config = var.postgresql
  }

  ai = var.openai

  remote_secrets = {
    apiKeys = local.apiKeys
    auth = local.auth
    file = local.file
    db = local.remote_db
    ai = local.ai
  }

  local_secrets = {
    apiKeys = local.apiKeys
    auth = local.auth
    file = local.file
    db = local.local_db
    ai = local.ai
  }
}

resource "aws_secretsmanager_secret" "remote_secrets" {
  name = "${var.project}-${var.stage}-remote-keys"
}

resource "aws_secretsmanager_secret_version" "remote_config" {
  secret_id     = aws_secretsmanager_secret.remote_secrets.id

  secret_string = jsonencode(local.remote_secrets)

  lifecycle {
    ignore_changes = [secret_string]
  }
}

resource "aws_secretsmanager_secret" "local_secrets" {
  name = "${var.project}-${var.stage}-local-keys"
}

resource "aws_secretsmanager_secret_version" "local_config" {
  secret_id     = aws_secretsmanager_secret.local_secrets.id

  secret_string = jsonencode(local.local_secrets)

  lifecycle {
    ignore_changes = [secret_string]
  }
}