import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import configuration, {
  TypeOrmConfigService,
  validationSchema,
} from '../config';
import { DaoSlimModule } from 'src/daos/dao-slim.module';
import { ProposalSlimModule } from 'src/proposals/proposal-slim.module';
import { NearModule } from 'src/near/near.module';
import { TransactionModule } from 'src/transactions/transaction.module';
import { SputnikDaoService } from 'src/sputnikdao/sputnik.service';
import { AggregatorService } from './aggregator.service';
import { AppController } from 'src/app.controller';
import { EventModule } from 'src/events/events.module';
import { GarbageCollectorService } from './garbage-collector.service';
import { ConfigModule } from '@nestjs/config';
import { BountySlimModule } from 'src/bounties/bounty-slim.module';

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
    ScheduleModule.forRoot(),
    DaoSlimModule,
    ProposalSlimModule,
    NearModule,
    TransactionModule,
    EventModule,
    BountySlimModule,
  ],
  controllers: [AppController],
  providers: [
    SputnikDaoService,
    AggregatorService,
    GarbageCollectorService,
  ],
})
export class AggregatorModule {}
