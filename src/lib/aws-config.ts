import { S3Client } from "@aws-sdk/client-s3"

// The SDK will automatically use credentials from ~/.aws/credentials
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1'
})

// Only need the bucket name in env
export const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME! 