resource "aws_apigatewayv2_api" "apigateway" {
  name          = "${var.project}-${var.stage}-apigateway"
  protocol_type = "HTTP"

  tags = {
    ManagedBy = "Terraform",
    Project = "${var.project}",
    Environment = "${var.stage}"
  }
}

resource "aws_apigatewayv2_stage" "apigateway" {
  name        = "${var.project}-${var.stage}-apigateway-stage"
  api_id      = aws_apigatewayv2_api.apigateway.id
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.apigateway.arn

    format = jsonencode({
      httpMethod              = "$context.httpMethod"
      integrationErrorMessage = "$context.integrationErrorMessage"
      protocol                = "$context.protocol"
      requestId               = "$context.requestId"
      routeKey                = "$context.routeKey"
      resourcePath            = "$context.resourcePath"
      responseLength          = "$context.responseLength"
      requestTime             = "$context.requestTime"
      sourceIp                = "$context.identity.sourceIp"
      status                  = "$context.status"
    })
  }
}

resource "aws_cloudwatch_log_group" "apigateway" {
  name              = "/aws/apigateway/${aws_apigatewayv2_api.apigateway.name}"
  retention_in_days = 5
}

module "lambda" {
  source = "./lambda"
  for_each = toset(var.lambdas)

  project = var.project
  stage = var.stage
  name = each.key

  source_arn = aws_apigatewayv2_api.apigateway.execution_arn
  gateway_id = aws_apigatewayv2_api.apigateway.id
}