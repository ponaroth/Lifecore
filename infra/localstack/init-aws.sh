#!/bin/bash
# Creates the local AWS resources when LocalStack starts.
set -euo pipefail

# Private, versioned bucket for signed PDFs
awslocal s3api create-bucket --bucket lifecore-documents
awslocal s3api put-public-access-block --bucket lifecore-documents \
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
awslocal s3api put-bucket-versioning --bucket lifecore-documents --versioning-configuration Status=Enabled

# Domain events: services publish to one SNS topic; each consumer has its own SQS queue (+ DLQ)
TOPIC_ARN=$(awslocal sns create-topic --name lifecore-domain-events --query TopicArn --output text)
DLQ_URL=$(awslocal sqs create-queue --queue-name lifecore-audit-events-dlq --query QueueUrl --output text)
DLQ_ARN=$(awslocal sqs get-queue-attributes --queue-url "$DLQ_URL" --attribute-names QueueArn --query Attributes.QueueArn --output text)
QUEUE_URL=$(awslocal sqs create-queue --queue-name lifecore-audit-events \
  --attributes "{\"RedrivePolicy\":\"{\\\"deadLetterTargetArn\\\":\\\"$DLQ_ARN\\\",\\\"maxReceiveCount\\\":\\\"5\\\"}\"}" \
  --query QueueUrl --output text)
QUEUE_ARN=$(awslocal sqs get-queue-attributes --queue-url "$QUEUE_URL" --attribute-names QueueArn --query Attributes.QueueArn --output text)
awslocal sns subscribe --topic-arn "$TOPIC_ARN" --protocol sqs --notification-endpoint "$QUEUE_ARN" \
  --attributes RawMessageDelivery=true

touch /tmp/lifecore-ready
echo "LifeCore local AWS resources ready"
