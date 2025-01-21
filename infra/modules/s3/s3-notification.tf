resource "aws_s3_bucket_notification" "s3_bucket_notification" {
  bucket = aws_s3_bucket.s3_bucket.id

  queue {
    events    = ["s3:ObjectCreated:*"]
    queue_arn = aws_sqs_queue.s3_bucket_sqs.arn
    # filter_prefix = "files/"
  }
}
