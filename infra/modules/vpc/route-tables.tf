# Public Routing
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = var.destination_cidr_block
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name                    = "${var.project}-${var.stage}-public-route-table",
    Project                 = var.project
    Environment             = var.stage
    ManagedBy               = "terraform"
  }
}

resource "aws_route_table_association" "public" {
  for_each                  = aws_subnet.public
  subnet_id                 = each.value.id
  route_table_id            = aws_route_table.public.id
}

# Private Routing
resource "aws_route_table" "private" {
  vpc_id                    = aws_vpc.main.id

  route {
    cidr_block = var.destination_cidr_block
    nat_gateway_id = aws_nat_gateway.main[0].id
  }

  tags = {
    Name                    = "${var.project}-${var.stage}-private-route-table",
    Project                 = var.project
    Environment             = var.stage
    ManagedBy                = "terraform"
  }
}

resource "aws_route_table_association" "private" {
  for_each                  = aws_subnet.private
  subnet_id                 = each.value.id
  route_table_id            = aws_route_table.private.id
}
