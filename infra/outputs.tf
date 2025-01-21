output "vpc_id" {
  value = module.vpc.vpc_id
}

output "remote_secrets" {
  value = module.secrets.remote_secrets
}
output "local_secrets" {
  value = module.secrets.local_secrets
}