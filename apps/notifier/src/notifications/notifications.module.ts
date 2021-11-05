import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription, SubscriptionModule } from '@sputnik-v2/subscription';
import { AccountModule, Account } from '@sputnik-v2/account';
import { DaoModule, Dao } from '@sputnik-v2/dao';
import { NotifierValidationSchema } from '@sputnik-v2/config/validation/notifier.schema';
import configuration from '@sputnik-v2/config/notifier-config';
import {
  TypeOrmConfigService,
  validate,
} from '@sputnik-v2/config/notifier-config';

import { NotificationsController } from './notifications.controller';
import { NotificationService } from './notifications.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configuration,
      validate: (config) => validate(NotifierValidationSchema, config),
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    TypeOrmModule.forFeature([Subscription, Account, Dao]),
    SubscriptionModule,
    AccountModule,
    DaoModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationService],
})
export class NotificationsModule {}
