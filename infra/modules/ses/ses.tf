resource "aws_ses_domain_identity" "domain_identity" {
  domain = var.domain
}

resource "aws_ses_email_identity" "email_identity" {
  email = var.email_identity
}

# Create Domain DKIM resource
resource "aws_ses_domain_dkim" "domain_dkim" {
  domain = aws_ses_domain_identity.domain_identity.domain
}

# Create Domain Mail From
resource "aws_ses_domain_mail_from" "domain_mail_from" {
  domain           = aws_ses_domain_identity.domain_identity.domain
  mail_from_domain = "${var.mail_from_subdomain}.${var.domain}"

  depends_on = [
    aws_route53_record.spf_domain,
    # aws_route53_record.mx_send_mail_from,
    # aws_route53_record.dmarc_domain,
    # aws_route53_record.mx_receive
  ]
}
