data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

resource "aws_lambda_function" "function" {
  function_name    = "${var.name}"
  # handler          = "apps/${var.name}/src/lambda.handler"
  role             = aws_iam_role.lambda_role.arn
  # runtime          = "nodejs20.x"

  package_type    = "Image"
  image_uri       = format("%v.dkr.ecr.%v.amazonaws.com/%v:latest",
                          data.aws_caller_identity.current.account_id,
                          data.aws_region.current.name,
                          "${var.project}-${var.stage}-${var.name}")
  timeout         = 10 #seconds

  environment {
    variables = {
      NODE_ENV = var.stage
    }
  }
}

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${var.project}-${var.stage}-${var.name}"
  retention_in_days = 5
}

resource "aws_apigatewayv2_integration" "integration" {
  api_id             = var.gateway_id
  integration_method = "POST"
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.function.invoke_arn
}

resource "aws_apigatewayv2_route" "proxy" {
  api_id    = var.gateway_id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.integration.id}"
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.function.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn = "${var.source_arn}/*/*"
}

# resource "aws_lambda_permission" "lambda" {
#   statement_id  = "AllowAPIGatewayInvoke"
#   action        = "lambda:InvokeFunction"
#   function_name = aws_lambda_function.function.function_name
#   principal     = "apigateway.amazonaws.com"
#   source_arn    = "${var.source_arn}/*/*"
# }
