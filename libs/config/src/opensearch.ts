import { registerAs } from '@nestjs/config';

export default registerAs('opensearch', () => {
  return {
    node: process.env.OPENSEARCH_NODE_URL,
  };
});
