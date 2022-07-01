import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule, Params } from 'nestjs-pino';

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
import { ProposalModule } from '@sputnik-v2/proposal';
import { EventModule } from '@sputnik-v2/event';

import { DaoAggregatorModule } from './dao-aggregator/dao-aggregator.module';
import { ProposalAggregatorModule } from './proposal-aggregator/proposal-aggregator.module';
import { BountyAggregatorModule } from './bounty-aggregator/bounty-aggregator.module';
import { TokenAggregatorModule } from './token-aggregator/token-aggregator.module';
import { StatsAggregatorModule } from './stats-aggregator/stats-aggregator.module';
import { AggregatorService } from './aggregator.service';
import { AggregatorController } from './aggregator.controller';

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
      validate: (config) => validate(AggregatorValidationSchema, config),
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    ScheduleModule.forRoot(),
    NearIndexerModule,
    DaoModule,
    ProposalModule,
    TransactionHandlerModule,
    TransactionModule,
    TokenModule,
    DaoAggregatorModule,
    ProposalAggregatorModule,
    BountyAggregatorModule,
    TokenAggregatorModule,
    StatsAggregatorModule,
    HttpCacheModule,
    EventModule,
  ],
  controllers: [AggregatorController],
  providers: [AggregatorService],
})
export class AggregatorModule {}
