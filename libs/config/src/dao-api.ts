import { registerAs } from '@nestjs/config';

export default registerAs('dao_api', () => {
  return {
    apiUrl: process.env.DAO_API_URL,
  };
});
