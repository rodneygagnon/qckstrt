# Create SQS and allow messages from S3 bucket and SNS Topic
resource "aws_sqs_queue" "s3_bucket_sqs" {
  name = "${var.project}-${var.stage}-bucket-sqs-notifications"
  policy = <<POLICY
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": "*",
        "Action": "sqs:SendMessage",
        "Resource": "arn:aws:sqs:*:*:${var.project}-${var.stage}-bucket-sqs-notifications",
        "Condition": {
          "ArnEquals": {
            "aws:SourceArn": "${aws_s3_bucket.s3_bucket.arn}" 
          }
        }
      },
      {
        "Effect": "Allow",
        "Principal": { "Service": "sns.amazonaws.com" },
        "Action": "sqs:SendMessage",
        "Resource": "arn:aws:sqs:*:*:${var.project}-${var.stage}-bucket-sqs-notifications",
        "Condition": {
          "ArnEquals": {
            "aws:SourceArn": "${aws_sns_topic.s3_sns_topic.arn}"
          }
        }
      }
    ]
  }
  POLICY
}

# Subscribe SQS queue to SNS topic
resource "aws_sns_topic_subscription" "s3_bucket_sqs_subscription" {
  topic_arn = aws_sns_topic.s3_sns_topic.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.s3_bucket_sqs.arn
}