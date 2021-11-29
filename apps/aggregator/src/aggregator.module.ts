import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import configuration, {
  TypeOrmConfigService,
  validate,
} from '@sputnik-v2/config/aggregator-config';
import { AggregatorValidationSchema } from '@sputnik-v2/config/validation';
import { NearIndexerModule } from '@sputnik-v2/near-indexer';
import { DaoModule } from '@sputnik-v2/dao';
import { TransactionModule } from '@sputnik-v2/transaction';
import { TransactionHandlerModule } from '@sputnik-v2/transaction-handler';
import { HttpCacheModule } from '@sputnik-v2/cache';
import { TokenModule } from '@sputnik-v2/token';

import { AggregatorService } from './aggregator.service';
import { DaoAggregatorModule } from './dao-aggregator/dao-aggregator.module';
import { ProposalAggregatorModule } from './proposal-aggregator/proposal-aggregator.module';
import { BountyAggregatorModule } from './bounty-aggregator/bounty-aggregator.module';
import { TokenAggregatorModule } from './token-aggregator/token-aggregator.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configuration,
      validate: (config) => validate(AggregatorValidationSchema, config),
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    ScheduleModule.forRoot(),
    NearIndexerModule,
    DaoModule,
    TransactionHandlerModule,
    TransactionModule,
    TokenModule,
    DaoAggregatorModule,
    ProposalAggregatorModule,
    BountyAggregatorModule,
    TokenAggregatorModule,
    HttpCacheModule,
  ],
  providers: [AggregatorService],
})
export class AggregatorModule {}
