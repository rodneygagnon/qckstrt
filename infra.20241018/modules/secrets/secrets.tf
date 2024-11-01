resource "random_password" "api_key" {
  length           = 16
  special          = true
}

locals {
  secrets = {
    organizations_port = var.secrets.organizations_port
    persons_port = var.secrets.persons_port
    roles_port = var.secrets.roles_port
    api_key = random_password.api_key.result
    enc_alg = var.secrets.enc_alg
  }
}

resource "aws_secretsmanager_secret" "secretmanager" {
  name = "${var.project}-${var.stage}-secrets"
}

resource "aws_secretsmanager_secret_version" "config" {
  secret_id     = aws_secretsmanager_secret.secretmanager.id

  secret_string = jsonencode(local.secrets)

  lifecycle {
    ignore_changes = [secret_string]
  }
}
