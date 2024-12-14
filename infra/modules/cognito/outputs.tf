output "userPoolId" {
  value   = aws_cognito_user_pool.user_pool.id
}

output "userPoolClientId" {
  value   = aws_cognito_user_pool_client.user_pool_client.id
}
