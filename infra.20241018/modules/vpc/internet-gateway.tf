resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "${var.project}-${var.stage}-internet-gateway",
    Project = var.project
    Environment = var.stage
    ManagedBy = "terraform"
  }
}
