resource "aws_network_acl" "public" {
    vpc_id = aws_vpc.main.id

    dynamic "ingress" {
        for_each = var.public_subnet_ingress_nacls
        content {
            rule_no    = ingress.key
            protocol   = ingress.value["protocol"]
            from_port  = ingress.value["from_port"]
            to_port    = ingress.value["to_port"]
            action     = ingress.value["action"]
            cidr_block = ingress.value["cidr_block"]
        }
    }

    dynamic "egress" {
        for_each = var.public_subnet_egress_nacls
        content {
            rule_no    = egress.key
            protocol   = egress.value["protocol"]
            from_port  = egress.value["from_port"]
            to_port    = egress.value["to_port"]
            action     = egress.value["action"]
            cidr_block = egress.value["cidr_block"]
        }
    }
    tags = {
        Name = "${var.project}-${var.stage}-public-subnet-nacl"
        Project = var.project
        Environment = var.stage
        ManagedBy = "terraform"
    }
}

resource "aws_network_acl" "private" {
    vpc_id = aws_vpc.main.id

    dynamic "ingress" {
        for_each = var.private_subnet_ingress_nacls
        content {
            rule_no    = ingress.key
            protocol   = ingress.value["protocol"]
            from_port  = ingress.value["from_port"]
            to_port    = ingress.value["to_port"]
            action     = ingress.value["action"]
            cidr_block = ingress.value["cidr_block"]
        }
    }

    dynamic "egress" {
        for_each = var.private_subnet_egress_nacls
        content {
            rule_no    = egress.key
            protocol   = egress.value["protocol"]
            from_port  = egress.value["from_port"]
            to_port    = egress.value["to_port"]
            action     = egress.value["action"]
            cidr_block = egress.value["cidr_block"]
        }
    }
    tags = {
        Name = "${var.project}-${var.stage}-private-subnet-nacl"
        Project = var.project
        Environment = var.stage
        ManagedBy = "terraform"
    }
}

resource "aws_network_acl_association" "public" {
    for_each        = aws_subnet.public
    subnet_id       = each.value.id
    network_acl_id  = aws_network_acl.public.id
}

resource "aws_network_acl_association" "private" {
    for_each        = aws_subnet.private
    subnet_id       = each.value.id
    network_acl_id  = aws_network_acl.private.id
}
