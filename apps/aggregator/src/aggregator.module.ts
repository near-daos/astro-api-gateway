import { Module } from '@nestjs/common';
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
import { TokenModule } from '@sputnik-v2/token';
import { AggregatorValidationSchema } from '@sputnik-v2/config/validation/aggregator.schema';
import configuration, {
  TypeOrmConfigService,
  validate,
} from '@sputnik-v2/config/aggregator-config';

import { AggregatorService } from './aggregator.service';

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
    DaoModule,
    ProposalModule,
    NearIndexerModule,
    NearApiModule,
    TransactionModule,
    EventModule,
    BountyModule,
    TokenModule,
  ],
  providers: [SputnikDaoService, AggregatorService],
})
export class AggregatorModule {}
