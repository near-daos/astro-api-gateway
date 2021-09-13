import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './api.controller';
import configuration, {
  TypeOrmConfigService,
  validate,
} from './config/api-config';
import { DaoModule } from './daos/dao.module';
import { SubscriptionModule } from './subscriptions/subscription.module';
import { ProposalModule } from './proposals/proposal.module';
import { SearchModule } from './search/search.module';
import { TransactionModule } from './transactions/transaction.module';
import { HttpCacheModule } from './cache/cache.module';
import { AccountModule } from './account/account.module';
import { BountyModule } from './bounties/bounty.module';
import { TokenModule } from './tokens/token.module';
import { ApiValidationSchema } from './config/schema/api.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configuration,
      validate: (config) => validate(ApiValidationSchema, config),
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    DaoModule,
    ProposalModule,
    SearchModule,
    TransactionModule,
    SubscriptionModule,
    HttpCacheModule,
    AccountModule,
    BountyModule,
    TokenModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
