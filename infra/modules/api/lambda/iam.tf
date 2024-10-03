resource "aws_iam_policy" "lambda_policy" {
  policy = jsonencode({
    Statement = [
      {
        Action = [
          "lambda:InvokeFunction",
          "lambda:InvokeAsync",
        ]
        Effect   = "Allow",
        Resource = "*",
      },
      {
        Action = [
          "SNS:Publish",
        ]
        Effect   = "Allow",
        Resource = "*",
      },
      {
        Action = [
          "SQS:SendMessage",
          "SQS:DeleteMessage",
          "SQS:ReceiveMessage",
          "SQS:GetQueueUrl",
          "SQS:GetQueueUrl",
          "SQS:ListQueues"
        ]
        Effect   = "Allow",
        Resource = "*",
      },
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ],
        Effect = "Allow",
        Resource = [
          "*",
        ]
      },
    ]
    Version = "2012-10-17",
  })
}

resource "aws_iam_role" "lambda_role" {
  name = "${var.project}-${var.stage}-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Sid = "",
        Principal = {
          Service = "lambda.amazonaws.com",
        }
      }
    ]
  })
  managed_policy_arns = [
    aws_iam_policy.lambda_policy.arn,
  ]
}

resource "aws_iam_role_policy_attachment" "lambda_role_policy_attachment" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda_role.name
}
