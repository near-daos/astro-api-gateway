import { registerAs } from '@nestjs/config';

export default registerAs('dynamodb', () => ({
  region: process.env.DYNAMODB_REGION,
  endpoint: process.env.DYNAMODB_ENDPOINT,

  // TODO: make use of default aws credentials injection approach
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
}));
