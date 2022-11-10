import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule, Params } from 'nestjs-pino';
import { DatadogTraceModule } from 'nestjs-ddtrace';

import { ApiValidationSchema } from '@sputnik-v2/config/validation/api.schema';
import configuration, {
  TypeOrmConfigService,
  validate,
} from '@sputnik-v2/config/api-config';
import { CacheConfigService } from '@sputnik-v2/config/api-config';
import { HttpCacheModule } from '@sputnik-v2/cache';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { EventModule } from '@sputnik-v2/event';
import { WebsocketModule, WebsocketGateway } from '@sputnik-v2/websocket';

import { BountyModule } from './bounty/bounty.module';
import { DaoModule } from './dao/dao.module';
import { ProposalModule } from './proposal/proposal.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { TokenModule } from './token/token.module';
import { TransactionModule } from './transaction/transaction.module';
import { AppController } from './api.controller';
import { NotificationModule } from './notification/notification.module';
import { CommentModule } from './comment/comment.module';
import { AggregatorModule } from './aggregator/aggregator.module';
import { MetricsModule } from './metrics/metrics.module';
import { StatsModule } from './stats/stats.module';
import { ApiDaoSettingsModule } from './dao-settings/dao-settings.module';
import { AccountModule } from './account/account.module';
import { ProposalTemplateModule } from './proposal-template/proposal-template.module';
import { SearchModule } from './search/search.module';

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
    DatadogTraceModule.forRoot(),
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: configuration,
      validate: (config) => validate(ApiValidationSchema, config),
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): ThrottlerModuleOptions => {
        return {
          ttl: configService.get('api.rateTtl'),
          limit: configService.get('api.rateLimit'),
        };
      },
    }),
    BountyModule,
    DaoModule,
    ApiDaoSettingsModule,
    ProposalTemplateModule,
    ProposalModule,
    SubscriptionModule,
    TokenModule,
    TransactionModule,
    HttpCacheModule,
    WebsocketModule,
    EventModule,
    NotificationModule,
    CommentModule,
    AggregatorModule,
    MetricsModule,
    StatsModule,
    AccountModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [WebsocketGateway],
})
export class AppModule {}
