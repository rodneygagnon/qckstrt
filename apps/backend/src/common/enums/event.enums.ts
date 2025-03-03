export enum EventSource {
  SNS = 'Notification',
  S3 = 'aws:s3',
}

export enum EventNamePrefix {
  ObjectCreated = 'ObjectCreated',
  ObjectRemoved = 'ObjectRemoved',
}

export enum EventStatus {
  SUCCEEDED = 'SUCCEEDED',
}
