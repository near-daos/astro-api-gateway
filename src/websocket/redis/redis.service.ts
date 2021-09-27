import { Inject, Injectable } from '@nestjs/common';
import { filter, map, Observable, Observer } from 'rxjs';
import {
  REDIS_PUBLISHER_CLIENT,
  REDIS_SUBSCRIBER_CLIENT,
} from './redis.constants';
import { RedisClient } from './redis.providers';

export interface RedisSubscribeMessage {
  readonly message: string;
  readonly channel: string;
}

@Injectable()
export class RedisService {
  public constructor(
    @Inject(REDIS_SUBSCRIBER_CLIENT)
    private readonly redisSubscriberClient: RedisClient,
    @Inject(REDIS_PUBLISHER_CLIENT)
    private readonly redisPublisherClient: RedisClient,
  ) {}

  public fromEvent<T>(eventName: string): Observable<T> {
    this.redisSubscriberClient.subscribe(eventName);

    return new Observable((observer: Observer<RedisSubscribeMessage>) =>
      this.redisSubscriberClient.on('message', (channel, message) =>
        observer.next({ channel, message }),
      ),
    ).pipe(
      filter(({ channel }) => channel === eventName),
      map(({ message }) => JSON.parse(message)),
    );
  }

  public async publish(channel: string, value: unknown): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      return this.redisPublisherClient.publish(
        channel,
        JSON.stringify(value),
        (error, reply) => {
          if (error) {
            return reject(error);
          }

          return resolve(reply);
        },
      );
    });
  }
}
