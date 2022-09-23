import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule, Params } from 'nestjs-pino';

import { Subscription, SubscriptionModule } from '@sputnik-v2/subscription';
import { AccountModule, Account } from '@sputnik-v2/account';
import { NotificationModule } from '@sputnik-v2/notification';
import { DaoModule } from '@sputnik-v2/dao';
import { ProposalModule } from '@sputnik-v2/proposal';
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
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Params => {
        return {
          pinoHttp: {
            level: configService.get('logLevel'),
          },
        };
      },
    }),
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
  ],
  controllers: [NotifierController],
  providers: [NotificationHandlerService],
})
export class NotifierModule {}
