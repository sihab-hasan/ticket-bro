'use strict';
const s3Config = {
  region:          process.env.AWS_REGION      || 'us-east-1',
  bucket:          process.env.AWS_S3_BUCKET   || '',
  accessKeyId:     process.env.AWS_ACCESS_KEY  || '',
  secretAccessKey: process.env.AWS_SECRET_KEY  || '',
  isConfigured: () => !!(process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY),
};
module.exports = s3Config;
