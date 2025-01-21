# Create an SNS Topic for AmazonTextract (NOTE: Must be prefixed by 'AmazonTextract')
resource "aws_sns_topic" "s3_sns_topic" {
  name = "AmazonTextract-${var.project}-${var.stage}-sns-topic"
}