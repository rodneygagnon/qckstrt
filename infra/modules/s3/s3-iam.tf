data "aws_caller_identity" "current" {}

locals {
  account = data.aws_caller_identity.current.account_id
}

# Create Textract Iam user resource
resource "aws_iam_user" "s3_iam_user" {
  name = "awstextract@${var.domain}"
}

### Allow PassRole ###
data "aws_iam_policy_document" "allow_iam_passrole_to_service" {
  statement {
    actions   = ["iam:PassRole"]
    resources = ["*"]
    condition {
      test      = "StringEquals"
      variable  = "iam:PassedToService"
      values    = ["textract.amazonaws.com"]
    }
  }
}
resource "aws_iam_user_policy" "awstextract_passed_to_service_policy" {
  name   = "${aws_iam_user.s3_iam_user.name}_awstextract_passed_to_service"
  user   = aws_iam_user.s3_iam_user.name
  policy = data.aws_iam_policy_document.allow_iam_passrole_to_service.json
}

### Creates Textract Iam role resource ###
resource "aws_iam_role" "awstextract_service_role" {
  name               = "${var.project}-${var.stage}-textract-role"

  assume_role_policy = jsonencode({
    Statement = [{
      Sid = "ConfusedDeputyPreventionExamplePolicy"
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "textract.amazonaws.com"
      }
      Condition = {
        StringEquals = {
          "aws:SourceAccount" = "${local.account}"
        },
        ArnLike = {
          "aws:SourceArn" = "arn:aws:textract:*:${local.account}:*"
        }
      }
    }]
    Version = "2012-10-17"
  })
}

resource "aws_iam_role_policy_attachment" "AmazonS3ReadOnlyAccess" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"
  role       = aws_iam_role.awstextract_service_role.name
}

resource "aws_iam_role_policy_attachment" "AmazonSNSFullAccess" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonSNSFullAccess"
  role       = aws_iam_role.awstextract_service_role.name
}

resource "aws_iam_role_policy_attachment" "AmazonSQSFullAccess" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonSQSFullAccess"
  role       = aws_iam_role.awstextract_service_role.name
}

resource "aws_iam_role_policy_attachment" "AmazonTextractFullAccess" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonTextractFullAccess"
  role       = aws_iam_role.awstextract_service_role.name
}

resource "aws_iam_role_policy_attachment" "AmazonTextractServiceRole" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonTextractServiceRole"
  role       = aws_iam_role.awstextract_service_role.name
}

data "aws_iam_policy_document" "allow_iam_passrole" {
  statement {
    actions   = ["iam:PassRole"]
    resources = ["${aws_iam_role.awstextract_service_role.arn}"]
  }
}

resource "aws_iam_user_policy" "awstextract_passrole_policy" {
  name   = "${aws_iam_user.s3_iam_user.name}_awstextract_passrole"
  user   = aws_iam_user.s3_iam_user.name
  policy = data.aws_iam_policy_document.allow_iam_passrole.json
}
