import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiValidationSchema } from '@sputnik-v2/config/validation/api.schema';
import configuration, {
  TypeOrmConfigService,
  validate,
} from '@sputnik-v2/config/api-config';
import { CacheConfigService } from '@sputnik-v2/config/api-config';
import { HttpCacheModule } from '@sputnik-v2/cache';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';

import { AccountModule } from './account/account.module';
import { BountyModule } from './bounty/bounty.module';
import { DaoModule } from './dao/dao.module';
import { ProposalModule } from './proposal/proposal.module';
import { SearchModule } from './search/search.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { TokenModule } from './token/token.module';
import { TransactionModule } from './transaction/transaction.module';
import { AppController } from './api.controller';
import { WebsocketModule } from './websocket/websocket.module';
import { WebsocketGateway } from './websocket/websocket.gateway';
import { EventModule } from '@sputnik-v2/event';
import { NotificationModule } from './notification/notification.module';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [
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
    AccountModule,
    BountyModule,
    DaoModule,
    ProposalModule,
    SearchModule,
    SubscriptionModule,
    TokenModule,
    TransactionModule,
    HttpCacheModule,
    WebsocketModule,
    EventModule,
    NotificationModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [WebsocketGateway],
})
export class AppModule {}
