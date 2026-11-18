#!/bin/bash
# Creates the private documents bucket when LocalStack starts.
set -euo pipefail
awslocal s3api create-bucket --bucket lifecore-documents
awslocal s3api put-public-access-block --bucket lifecore-documents \
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
awslocal s3api put-bucket-versioning --bucket lifecore-documents --versioning-configuration Status=Enabled
echo "lifecore-documents bucket ready"
