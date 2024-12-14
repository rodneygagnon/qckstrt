output "database" {
  value = module.aurora_postgresql_v2.cluster_database_name
}

output "database_arn" {
  value = module.aurora_postgresql_v2.cluster_arn
}

output "database_secret" {
  value = module.aurora_postgresql_v2.cluster_master_user_secret[0].secret_arn
}
