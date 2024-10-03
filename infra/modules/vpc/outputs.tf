output "vpc_id" {
  value   = aws_vpc.main.id
}
 
output "vpc_public_subnets" {
  value = [ for k, v in aws_subnet.private : aws_subnet.public[k].id ]
}
 
output "vpc_private_subnets" {
  value = [ for k, v in aws_subnet.private : aws_subnet.private[k].id ]
}