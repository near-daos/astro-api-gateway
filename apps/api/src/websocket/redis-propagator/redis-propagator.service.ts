import { Injectable } from '@nestjs/common';
import { tap } from 'rxjs';
import { RedisService } from '../redis/redis.service';
import { SocketStateService } from '../socket-state/socket-state.service';
import { SocketEventEmitDTO } from '../socket/dto/socket-event-emit.dto';
import { SocketEventSendDTO } from '../socket/dto/socket-event-send.dto';
import {
  REDIS_SOCKET_EVENT_EMIT_ALL_NAME,
  REDIS_SOCKET_EVENT_EMIT_AUTHENTICATED_NAME,
  REDIS_SOCKET_EVENT_SEND_NAME,
} from './redis-propagator.constants';
import { SocketService } from '../socket/socket.service';

@Injectable()
export class RedisPropagatorService {
  public constructor(
    private readonly socketStateService: SocketStateService,
    private readonly redisService: RedisService,
    private readonly socketService: SocketService,
  ) {
    this.redisService
      .fromEvent(REDIS_SOCKET_EVENT_SEND_NAME)
      .pipe(tap(this.consumeSendEvent))
      .subscribe();

    this.redisService
      .fromEvent(REDIS_SOCKET_EVENT_EMIT_ALL_NAME)
      .pipe(tap(this.consumeEmitToAllEvent))
      .subscribe();

    this.redisService
      .fromEvent(REDIS_SOCKET_EVENT_EMIT_AUTHENTICATED_NAME)
      .pipe(tap(this.consumeEmitToAuthenticatedEvent))
      .subscribe();
  }

  public consumeSendEvent = (eventInfo: SocketEventSendDTO): void => {
    return this.socketService.sendEvent(eventInfo);
  };

  public consumeEmitToAllEvent = (eventInfo: SocketEventEmitDTO): void => {
    this.socketService.emitToAllEvent(eventInfo);
  };

  public consumeEmitToAuthenticatedEvent = (
    eventInfo: SocketEventEmitDTO,
  ): void => {
    return this.socketService.emitToAuthenticatedEvent(eventInfo);
  };

  public propagateEvent(eventInfo: SocketEventSendDTO): boolean {
    if (!eventInfo.accountId) {
      return false;
    }

    this.redisService.publish(REDIS_SOCKET_EVENT_SEND_NAME, eventInfo);

    return true;
  }

  public emitToAuthenticated(eventInfo: SocketEventEmitDTO): boolean {
    this.redisService.publish(
      REDIS_SOCKET_EVENT_EMIT_AUTHENTICATED_NAME,
      eventInfo,
    );

    return true;
  }

  public emitToAll(eventInfo: SocketEventEmitDTO): boolean {
    this.redisService.publish(REDIS_SOCKET_EVENT_EMIT_ALL_NAME, eventInfo);

    return true;
  }
}
