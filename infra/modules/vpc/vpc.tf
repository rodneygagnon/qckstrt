resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  instance_tenancy     = var.instance_tenancy
  enable_dns_support   = var.enable_dns_support
  enable_dns_hostnames = var.enable_dns_hostnames

  tags = {
    Name = "${var.project}-${var.stage}-vpc"
    Project = var.project
    Environment = var.stage
    ManagedBy = "terraform"
  }
}