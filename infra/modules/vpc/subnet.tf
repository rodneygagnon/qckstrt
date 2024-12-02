data "aws_availability_zones" "available_azs" {
  state = "available"
}

locals {
  azs = tolist(data.aws_availability_zones.available_azs.names)
}

resource "aws_subnet" "public" {
  for_each                = toset(local.azs)

  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, index(local.azs, each.value))
  availability_zone       = each.value
  map_public_ip_on_launch = var.map_public_ip_on_launch

  depends_on = [ aws_vpc.main ]

  tags = {
    Name = "${var.project}-${var.stage}-public-subnet-${each.key}"
    Project = var.project
    Environment = var.stage
    ManagedBy = "terraform"
    Tier = "public"
    "kubernetes.io/role/elb" = "1"
    "kubernetes.io/cluster/${var.project}-${var.stage}-cluster" = "shared"
  }
}

resource "aws_subnet" "private" {
  for_each                = toset(local.azs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, index(local.azs, each.value) + 4)
  availability_zone       = each.value
  map_public_ip_on_launch = false

  depends_on = [ aws_vpc.main ]

  tags = {
    Name = "${var.project}-${var.stage}-private-subnet-${each.key}"
    Project = var.project
    Environment = var.stage
    ManagedBy = "terraform"
    Tier = "private"
    "kubernetes.io/role/internal-elb" = "1"
    "kubernetes.io/cluster/${var.project}-${var.stage}-cluster" = "shared"
  }
}

