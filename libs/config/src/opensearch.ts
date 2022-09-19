import { registerAs } from '@nestjs/config';

export default registerAs('opensearch', () => {
  return {
    node: process.env.OPENSEARCH_NODE_URL,
    username: process.env.OPENSEARCH_USERNAME,
    password: process.env.OPENSEARCH_PASSWORD,
  };
});
