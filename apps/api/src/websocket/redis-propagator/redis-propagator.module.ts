import { Module } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module';

import { RedisPropagatorService } from './redis-propagator.service';

@Module({
  imports: [RedisModule],
  providers: [RedisPropagatorService],
  exports: [RedisPropagatorService],
})
export class RedisPropagatorModule {}
