output "s3Bucket" {
  value   = aws_s3_bucket.s3_bucket.bucket
}

output "sqsBucketUrl" {
  value   = aws_sqs_queue.s3_bucket_sqs.url
}

output "snsTopicArn" {
  value   = aws_sns_topic.s3_sns_topic.arn
}

output "snsRoleArn" {
  value   = aws_iam_role.awstextract_service_role.arn
}
