import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { DaoModule } from '@sputnik-v2/dao';
import { ProposalModule } from '@sputnik-v2/proposal';
import { NearIndexerModule } from '@sputnik-v2/near-indexer';
import { NearApiModule } from '@sputnik-v2/near-api';
import { TransactionModule } from '@sputnik-v2/transaction';
import { SputnikDaoService } from '@sputnik-v2/sputnikdao';
import { EventModule } from '@sputnik-v2/event';
import { BountyModule } from '@sputnik-v2/bounty';
import { TokenModule, TokenFactoryService } from '@sputnik-v2/token';
import { CacheService } from '@sputnik-v2/cache';
import configuration, {
  TypeOrmConfigService,
  validate,
} from '@sputnik-v2/config/aggregator-dao-config';
import { AggregatorDaoValidationSchema } from '@sputnik-v2/config/validation/aggregator-dao.schema';
import { CacheConfigService } from '@sputnik-v2/config/api-config';

import { AccountChangeModule } from './account-change/account-change.module';
import { AggregatorDaoService } from './aggregator-dao.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: configuration,
      validate: (config) => validate(AggregatorDaoValidationSchema, config),
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    ScheduleModule.forRoot(),
    DaoModule,
    ProposalModule,
    NearIndexerModule,
    NearApiModule,
    TransactionModule,
    EventModule,
    BountyModule,
    TokenModule,
    AccountChangeModule,
  ],
  providers: [
    SputnikDaoService,
    TokenFactoryService,
    AggregatorDaoService,
    CacheService,
  ],
})
export class AggregatorDaoModule {}
