data "aws_availability_zones" "available_azs" {
  state = "available"
}

data "aws_rds_engine_version" "postgresql" {
  engine  = "aurora-postgresql"
  version = "16.1"
}

resource "random_string" "bedrock_password" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

locals {
  bedrock_password = random_string.bedrock_password.result
  bedrock_user = "bedrock_user"

  azs = [
    data.aws_availability_zones.available_azs.names[0],
    data.aws_availability_zones.available_azs.names[1]
  ]
}

# resource "aws_secretsmanager_secret" "bedrock_secret" {
#   name = "${var.project}-${var.stage}-bedrock-secret"
# }

# resource "aws_secretsmanager_secret_version" "bedrock_secret_version" {
#   secret_id = aws_secretsmanager_secret.bedrock_secret.id
#   secret_string = jsonencode({
#     username = local.bedrock_user
#     password = local.bedrock_password
#   })
# }

module "aurora_postgresql_v2" {
  source  = "terraform-aws-modules/rds-aurora/aws"
  version = "9.10.0"

  name = "${var.project}-${var.stage}-db-cluster"

  engine         = data.aws_rds_engine_version.postgresql.engine
  engine_version = data.aws_rds_engine_version.postgresql.version

  vpc_id  = var.vpc_id

  availability_zones = local.azs // tolist(data.aws_availability_zones.available_azs.names)

  subnets = var.subnet_ids
  create_db_subnet_group = true

  monitoring_interval = 60
  storage_encrypted   = true
  apply_immediately   = true
  skip_final_snapshot = true
  enable_http_endpoint = true
  # publicly_accessible = true

  serverlessv2_scaling_configuration = {
    min_capacity = 2
    max_capacity = 8
  }

  database_name               = "${var.project}${var.stage}db"
  master_username             = "${var.project}${var.stage}dbuser"
  manage_master_user_password = true

  instance_class = "db.serverless"
  instances = {
    one = {}
    two = {}
  }
}

resource "null_resource" "db_setup" {
  depends_on = [
    module.aurora_postgresql_v2
  ]

  triggers = {
    file = filesha1("${path.module}/rds-setup.sql")
  }

  provisioner "local-exec" {
    environment = {
      DB_ARN    = module.aurora_postgresql_v2.cluster_arn
      DB_NAME   = module.aurora_postgresql_v2.cluster_database_name
      DB_SECRET = module.aurora_postgresql_v2.cluster_master_user_secret[0].secret_arn
      DB_REGION = var.region
      DB_USER = local.bedrock_user
      DB_PASSWORD = local.bedrock_password
    }
    interpreter = ["/bin/bash", "-c"]
    command = <<EOF
			while read line; do
				newline=$(echo "$line" | sed "s/DB_USER/$DB_USER/;s/DB_PASSWORD/$DB_PASSWORD/")
        aws rds-data execute-statement  --region "$DB_REGION" --resource-arn "$DB_ARN" --database "$DB_NAME" --secret-arn "$DB_SECRET" --sql "$newline"
      done  < <(awk 'BEGIN{RS=";\n"}{gsub(/\n/,""); if(NF>0) {print $0";"}}' ${path.module}/rds-setup.sql)
    EOF
  }
}