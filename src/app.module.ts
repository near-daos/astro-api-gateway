import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import configuration, {
  TypeOrmConfigService,
  validationSchema,
} from './config';
import { DaoModule } from './daos/dao.module';
import { SubscriptionModule } from './subscriptions/subscription.module';
import { ProposalModule } from './proposals/proposal.module';
import { SearchModule } from './search/search.module';
import { TransactionModule } from './transactions/transaction.module';
import { HttpCacheModule } from './cache/cache.module';
import { AccountModule } from './account/account.module';
import { BountyModule } from './bounties/bounty.module';

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
    DaoModule,
    ProposalModule,
    SearchModule,
    TransactionModule,
    SubscriptionModule,
    HttpCacheModule,
    AccountModule,
    BountyModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
