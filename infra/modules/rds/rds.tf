data "aws_availability_zones" "available_azs" {
  state = "available"
}

data "aws_rds_engine_version" "postgresql" {
  engine  = "aurora-postgresql"
  version = "16.1"
}

module "aurora_postgresql_v2" {
  source  = "terraform-aws-modules/rds-aurora/aws"
  version = "9.10.0"

  name = "${var.project}-${var.stage}-db-cluster"

  engine         = data.aws_rds_engine_version.postgresql.engine
  engine_version = data.aws_rds_engine_version.postgresql.version

  vpc_id  = var.vpc_id

  availability_zones = tolist(data.aws_availability_zones.available_azs.names)

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