# Create Identity policy of SES
data "aws_iam_policy_document" "document" {
  statement {
    actions   = ["SES:SendEmail", "SES:SendRawEmail"]
    resources = [aws_ses_domain_identity.domain_identity.arn]
    principals {
      identifiers = ["*"]
      type        = "AWS"
    }
  }
}

data "aws_iam_policy_document" "allow_iam_name_to_send_emails" {
  statement {
    actions   = ["ses:SendRawEmail"]
    resources = ["*"]
  }
}

# Create SMTP Iam user resource
resource "aws_iam_user" "ses_iam_user" {
  name = "contact@${var.domain}"
}

# Create SMTP Iam access key resource
resource "aws_iam_access_key" "iam_access_key" {
  user = aws_iam_user.ses_iam_user.name
}

# Creates SMTP Iam user policy resource on AWS
resource "aws_iam_user_policy" "default" {
  name   = "${aws_iam_user.ses_iam_user.name}_iam_user"
  user   = aws_iam_user.ses_iam_user.name
  policy = data.aws_iam_policy_document.allow_iam_name_to_send_emails.json
}
