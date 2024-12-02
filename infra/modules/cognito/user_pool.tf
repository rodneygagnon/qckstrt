
resource "aws_cognito_user_pool" "user_pool" {
  name = "${var.project}-${var.stage}-users"

  # alias_attributes         = var.alias_attributes
  username_attributes      = var.username_attributes
  auto_verified_attributes = var.auto_verified_attributes

  username_configuration {
    case_sensitive = false
  }

  password_policy {
    minimum_length                   = var.password_minimum_length
    require_lowercase                = var.password_require_lowercase
    require_numbers                  = var.password_require_numbers
    require_symbols                  = var.password_require_symbols
    require_uppercase                = var.password_require_uppercase
    temporary_password_validity_days = var.temporary_password_validity_days
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  email_configuration {
    email_sending_account  = "DEVELOPER"
    reply_to_email_address = var.email_identity
    source_arn             = var.email_identity_source_arn
    from_email_address     = var.email_identity
  }

  admin_create_user_config {
    allow_admin_create_user_only = false

    invite_message_template {
      email_subject = var.invite_email_subject
      email_message = var.invite_email_message
      sms_message   = var.invite_sms_message
    }
  }

  dynamic "schema" {
    for_each = var.schema_attributes
    iterator = attribute

    content {
      name                     = attribute.value.name
      required                 = try(attribute.value.required, false)
      attribute_data_type      = attribute.value.type
      developer_only_attribute = try(attribute.value.developer_only_attribute, false)
      mutable                  = try(attribute.value.mutable, true)

      dynamic "number_attribute_constraints" {
        for_each = attribute.value.type == "Number" ? [true] : []

        content {
          min_value = lookup(attribute.value, "min_value", null)
          max_value = lookup(attribute.value, "max_value", null)
        }
      }

      dynamic "string_attribute_constraints" {
        for_each = attribute.value.type == "String" ? [true] : []

        content {
          min_length = lookup(attribute.value, "min_length", 0)
          max_length = lookup(attribute.value, "max_length", 2048)
        }
      }
    }
  }
}

# resource "aws_cognito_user_group" "admin_group" {
#   name          = "admins"
#   description   = "Administrators"
#   user_pool_id  = aws_cognito_user_pool.user_pool.id
#   precedence    = 0
# }

resource "aws_cognito_user_group" "groups" {
  for_each      = { for group in var.groups:  group.name => group }
  name          = each.value.name
  description   = each.value.description
  user_pool_id  = aws_cognito_user_pool.user_pool.id
  precedence    = each.value.precedence
}

resource "aws_cognito_user_pool_client" "user_pool_client" {
  name = "${var.project}-${var.stage}-client"
  user_pool_id = aws_cognito_user_pool.user_pool.id
  supported_identity_providers = [ "COGNITO" ]
  explicit_auth_flows = [ "ALLOW_USER_SRP_AUTH", "ALLOW_REFRESH_TOKEN_AUTH", "ALLOW_USER_PASSWORD_AUTH" ]

  generate_secret = false

  prevent_user_existence_errors = "ENABLED"

  access_token_validity = 1
  id_token_validity     = 1
  refresh_token_validity = 1

  token_validity_units {
    refresh_token = "hours"
    access_token  = "hours"
    id_token      = "hours"
  }
}

resource "aws_cognito_user_pool_domain" "user_pool_domain" {
  domain          = replace(var.domain, ".com", "")
  # certificate_arn = var.certificate_arn
  user_pool_id    = aws_cognito_user_pool.user_pool.id
}