import { UseInterceptors } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RedisPropagatorInterceptor } from './redis-propagator/redis-propagator.interceptor';

@UseInterceptors(RedisPropagatorInterceptor)
@WebSocketGateway()
export class WebsocketGateway {
  @SubscribeMessage('heartbeat')
  public findAll(): Observable<any> {
    return from(['Websocket connected!']).pipe(
      map((item) => {
        return { event: 'heartbeat', data: item };
      }),
    );
  }
}
