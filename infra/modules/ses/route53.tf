data "aws_route53_zone" "domain_zone" {
  name = var.domain
}

data "aws_region" "current" {}

# Verify domain DKIM
resource "aws_route53_record" "dkim" {
  count = 3

  zone_id = data.aws_route53_zone.domain_zone.zone_id
  name    = format("%s._domainkey.%s", element(aws_ses_domain_dkim.domain_dkim.dkim_tokens, count.index), var.domain)
  type    = "CNAME"
  ttl     = 600
  records = [format("%s.dkim.amazonses.com", element(aws_ses_domain_dkim.domain_dkim.dkim_tokens, count.index))]
}

# Create record of SPF for domain mail from
# resource "aws_route53_record" "spf_mail_from" {
#   zone_id = data.aws_route53_zone.domain_zone.zone_id
#   name    = aws_ses_domain_mail_from.domain_mail_from.mail_from_domain
#   type    = "TXT"
#   ttl     = "600"
#   records = ["v=spf1 include:amazonses.com -all"]
# }

# Create record of SPF for domain
resource "aws_route53_record" "spf_domain" {
  zone_id = data.aws_route53_zone.domain_zone.zone_id
  name    = var.mail_from_subdomain
  type    = "TXT"
  ttl     = "600"
  records = ["v=spf1 include:amazonses.com ~all"]
}

resource "aws_route53_record" "dmarc_domain" {
  zone_id = data.aws_route53_zone.domain_zone.zone_id
  name    = "_dmarc"
  type    = "TXT"
  ttl     = "600"
  records = ["v=DMARC1; p=none;"]
}

# Create record of MX for domain mail from
resource "aws_route53_record" "mx_send_mail_from" {
  zone_id = data.aws_route53_zone.domain_zone.zone_id
  name    = var.mail_from_subdomain
  type    = "MX"
  ttl     = "600"
  records = [format("10 feedback-smtp.%s.amazonses.com", data.aws_region.current.name)]
}

# Create record of MX for receipt
resource "aws_route53_record" "mx_receive" {
  zone_id = data.aws_route53_zone.domain_zone.zone_id
  name    = "${var.mail_from_subdomain}-receipt"
  type    = "MX"
  ttl     = "600"
  records = [format("10 inbound-smtp.%s.amazonaws.com", data.aws_region.current.name)]
}