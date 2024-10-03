data "aws_availability_zones" "available-azs" {
  state = "available"
}

locals {
  azs = tolist(data.aws_availability_zones.available-azs.names)
}

resource "aws_subnet" "public" {
  for_each                = toset(local.azs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, index(local.azs, each.value))
  availability_zone       = each.value
  map_public_ip_on_launch = var.map_public_ip_on_launch

  tags = {
    Name = "${var.project}-${var.stage}-public-subnet-${each.key}"
    Project = var.project
    Environment = var.stage
    ManagedBy = "terraform"
    "kubernetes.io/role/elb" = 1
    Tier = "public"
  }
}

resource "aws_route_table_association" "public" {
  for_each = aws_subnet.public
  subnet_id      = each.value.id
  route_table_id = aws_route_table.public.id
}

resource "aws_subnet" "private" {
  for_each                = toset(local.azs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, index(local.azs, each.value) + 4)
  availability_zone       = each.value
  map_public_ip_on_launch = var.map_public_ip_on_launch

  tags = {
    Name = "${var.project}-${var.stage}-private-subnet-${each.key}"
    Project = var.project
    Environment = var.stage
    ManagedBy = "terraform"
    "kubernetes.io/role/internal-elb" = 1
    Tier = "private"
  }
}

resource "aws_route_table_association" "private" {
  for_each = aws_subnet.private
  subnet_id      = each.value.id
  route_table_id = aws_route_table.private.id
}
