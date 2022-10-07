import { registerAs } from '@nestjs/config';

export default registerAs('dynamodb', () => ({
  region: process.env.DYNAMODB_REGION,
  endpoint: process.env.DYNAMODB_ENDPOINT,
}));
