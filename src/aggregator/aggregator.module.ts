import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScheduleModule } from '@nestjs/schedule';

import configuration, {
  TypeOrmConfigService,
  validationSchema
} from '../config';
import { DaoSlimModule } from 'src/daos/dao-slim.module';
import { ProposalSlimModule } from 'src/proposals/proposal-slim.module';
import { NEAR_INDEXER_DB_CONNECTION } from 'src/common/constants';
import { NearModule } from 'src/near/near.module';
import { TransactionModule } from 'src/transactions/transaction.module';
import { SputnikDaoService } from 'src/sputnikdao/sputnik.service';
import { AggregatorService } from './aggregator.service';
import { AppController } from 'src/app.controller';

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
    TypeOrmModule.forRootAsync({
      name: NEAR_INDEXER_DB_CONNECTION,
      useClass: TypeOrmConfigService,
    }),
    ScheduleModule.forRoot(),
    DaoSlimModule,
    ProposalSlimModule,
    NearModule,
    TransactionModule
  ],
  controllers: [AppController],
  providers: [SputnikDaoService, AggregatorService],
})
export class AggregatorModule {}
