data "aws_availability_zones" "available_azs" {
  state = "available"
}

data "aws_rds_engine_version" "postgresql" {
  engine  = "aurora-postgresql"
  version = "16.6"
}

module "aurora_postgresql_v2" {
  source  = "terraform-aws-modules/rds-aurora/aws"
  version = "9.10.0"

  name = "${var.project}-${var.stage}-db-cluster"

  engine         = data.aws_rds_engine_version.postgresql.engine
  engine_version = data.aws_rds_engine_version.postgresql.version
  # engine_mode    = "serverless"

  vpc_id  = var.vpc_id

  availability_zones = tolist(data.aws_availability_zones.available_azs.names)

  subnets = var.subnet_ids
  create_db_subnet_group = true
  # security_group_rules = {
  #   vpc_ingress = {
  #     cidr_blocks = module.vpc.private_subnets_cidr_blocks
  #   }
  # }

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

# resource "aws_rds_cluster" "postgresql" {
#   cluster_identifier          = "${var.project}-${var.stage}-cluster"

#   engine                      = data.aws_rds_engine_version.postgresql.engine
#   engine_version              = data.aws_rds_engine_version.postgresql.version
#   # engine_mode                 = "serverless"

#   availability_zones          = tolist(data.aws_availability_zones.available_azs.names)

#   database_name               = "${var.project}-${var.stage}-db"
#   master_username             = "${var.project}-${var.stage}-dbuser"
#   manage_master_user_password = true
#   backup_retention_period     = 5
#   preferred_backup_window     = "07:00-09:00"
#   enable_http_endpoint        = true
#   # storage_type                = "aurora-iopt1"
# }