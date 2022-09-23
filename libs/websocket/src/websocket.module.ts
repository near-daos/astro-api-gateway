import { Global, Module } from '@nestjs/common';

import { RedisPropagatorModule } from './redis-propagator';
import { RedisModule } from './redis/redis.module';
import { SocketStateModule } from './socket-state/socket-state.module';
import { SocketModule } from './socket/socket.module';

@Global()
@Module({
  imports: [
    RedisModule,
    RedisPropagatorModule,
    SocketStateModule,
    SocketModule,
  ],
  exports: [
    RedisModule,
    RedisPropagatorModule,
    SocketStateModule,
    SocketModule,
  ],
})
export class WebsocketModule {}
