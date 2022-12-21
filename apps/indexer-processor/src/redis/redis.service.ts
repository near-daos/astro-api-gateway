import Redis from 'ioredis';
import { Injectable, Logger } from '@nestjs/common';
import { parseJSON } from '@sputnik-v2/utils';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private readonly redis: Redis.Redis;

  constructor(private readonly configService: ConfigService) {
    const {
      indexerRedisHost,
      indexerRedisPort,
      indexerRedisPassword,
      indexerRedisDb,
    } = configService.get('indexer-processor');
    this.redis = new Redis({
      host: indexerRedisHost,
      port: indexerRedisPort,
      password: indexerRedisPassword,
      db: indexerRedisDb,
    });
  }

  async handleStream<T>(
    key: string,
    handler: (entries: T) => Promise<unknown>,
    maxItems = 10,
    interval = 3000,
  ) {
    const results = await this.redis.xread(
      'COUNT',
      maxItems,
      'STREAMS',
      key,
      0,
    );

    if (results) {
      const entries = results[0][1];
      this.logger.log(
        `Received ${entries.length} entries from ${key} redis stream`,
      );

      for (let i = 0; i < entries.length; i++) {
        const [id, arr] = entries[i];

        this.logger.log(`Handling entry ${id}`);
        await handler(parseJSON(arr[1]));
        this.logger.log(`Entry ${id} handled`);

        this.logger.log(`Removing entry ${id}`);
        await this.redis.xdel(key, id);
        this.logger.log(`Entry ${id} removed`);
      }

      this.logger.log(`Waiting for new ${key} entries...`);
    }

    setTimeout(() => this.handleStream(key, handler, interval), interval);
  }
}
