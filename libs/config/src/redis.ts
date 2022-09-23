import { registerAs } from '@nestjs/config';
import { parseRedisUrl } from 'parse-redis-url-simple';

export default registerAs('redis', () => {
  const {
    host: redisHost,
    port: redisPort,
    database: redisDB,
    password: redisPassword,
  } = parseRedisUrl(process.env.REDIS_SOCKET_URL)?.[0];

  return {
    redisHost,
    redisPort,
    redisDB,
    redisPassword,
  };
});
