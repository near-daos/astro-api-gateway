import { Controller, Get, Logger } from '@nestjs/common';
import { EventPattern, Transport } from '@nestjs/microservices';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { CacheService } from '@sputnik-v2/cache';
import { NewNotificationDto, NewCommentDto } from '@sputnik-v2/event';
import {
  EVENT_DELETE_COMMENT,
  EVENT_NEW_COMMENT,
  EVENT_NEW_NOTIFICATION,
} from '@sputnik-v2/common';

import {
  REDIS_SOCKET_EVENT_EMIT_ALL_NAME,
  REDIS_SOCKET_EVENT_EMIT_AUTHENTICATED_NAME,
} from './websocket/redis-propagator/redis-propagator.constants';
import { RedisService } from './websocket/redis/redis.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly redisService: RedisService,
  ) {}

  @ApiExcludeEndpoint()
  @Get()
  main(): string {
    return 'Sputnik v2 API v1.0';
  }

  @EventPattern(EVENT_NEW_NOTIFICATION, Transport.REDIS)
  async onNewNotification(data: NewNotificationDto) {
    this.logger.log(
      `Sending new notification ${data.notification.type} to Websocket clients.`,
    );
    await this.redisService.publish(REDIS_SOCKET_EVENT_EMIT_ALL_NAME, {
      event: 'notification',
      data: data.notification,
    });
    await this.redisService.publish(
      REDIS_SOCKET_EVENT_EMIT_AUTHENTICATED_NAME,
      {
        event: 'account-notification',
        accountEvents: data.accountNotifications,
      },
    );
  }

  @EventPattern(EVENT_NEW_COMMENT, Transport.REDIS)
  async onNewComment(data: NewCommentDto) {
    this.logger.log(
      `Sending new comment ${data.comment.id} to Websocket clients.`,
    );
    await this.redisService.publish(REDIS_SOCKET_EVENT_EMIT_ALL_NAME, {
      event: 'comment',
      data: data.comment,
    });
  }

  @EventPattern(EVENT_DELETE_COMMENT, Transport.REDIS)
  async onDeleteComment(data: NewCommentDto) {
    this.logger.log(
      `Sending removed comment ${data.comment.id} to Websocket clients.`,
    );
    await this.redisService.publish(REDIS_SOCKET_EVENT_EMIT_ALL_NAME, {
      event: 'comment-removed',
      data: data.comment,
    });
  }
}
