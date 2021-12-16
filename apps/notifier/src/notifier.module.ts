import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Subscription, SubscriptionModule } from '@sputnik-v2/subscription';
import { AccountModule, Account } from '@sputnik-v2/account';
import { NotificationModule } from '@sputnik-v2/notification';
import { DaoModule } from '@sputnik-v2/dao';
import { ProposalModule } from '@sputnik-v2/proposal';
import { EventModule } from '@sputnik-v2/event';
import { NotifierValidationSchema } from '@sputnik-v2/config/validation/notifier.schema';
import configuration from '@sputnik-v2/config/notifier-config';
import { validate } from '@sputnik-v2/config/notifier-config';
import { TypeOrmConfigService } from '@sputnik-v2/config/typeorm-config.service';

import { NotifierController } from './notifier.controller';
import { NotificationHandlerModule } from './notification-handler/notification-handler.module';
import { NotificationHandlerService } from './notification-handler/notification-handler.service';
import { AccountNotifierModule } from './account-notifier/account-notifier.module';

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
    TypeOrmModule.forFeature([Subscription, Account]),
    SubscriptionModule,
    NotificationModule,
    AccountModule,
    DaoModule,
    ProposalModule,
    NotificationHandlerModule,
    AccountNotifierModule,
    EventModule,
  ],
  controllers: [NotifierController],
  providers: [NotificationHandlerService],
})
export class NotifierModule {}
