import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import configuration, { TypeOrmConfigService, validationSchema } from '../config';
import { Subscription } from 'src/subscriptions/entities/subscription.entity';
import { NotificationsController } from './notifications.controller';
import { SubscriptionModule } from 'src/subscriptions/subscription.module';
import { NotificationService } from './notifications.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configuration,
      validationSchema,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    TypeOrmModule.forFeature([Subscription]),
    SubscriptionModule
  ],
  controllers: [NotificationsController],
  providers: [NotificationService]
})
export class NotificationsModule {}
