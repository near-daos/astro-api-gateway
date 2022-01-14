import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NearApiModule } from '@sputnik-v2/near-api';
import { SputnikModule } from '@sputnik-v2/sputnikdao';
import { DaoModule } from '@sputnik-v2/dao/dao.module';
import { BountyModule } from '@sputnik-v2/bounty';
import { ProposalModule } from '@sputnik-v2/proposal';
import { Transaction } from '@sputnik-v2/near-indexer';
import { EventModule } from '@sputnik-v2/event';

import { TransactionHandlerService } from './transaction-handler.service';
import { TransactionActionHandlerService } from './transaction-action-handler.service';
import { TransactionActionMapperService } from './transaction-action-mapper.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    NearApiModule,
    SputnikModule,
    DaoModule,
    BountyModule,
    ProposalModule,
    EventModule,
  ],
  providers: [
    TransactionHandlerService,
    TransactionActionHandlerService,
    TransactionActionMapperService,
  ],
  exports: [
    TransactionHandlerService,
    TransactionActionHandlerService,
    TransactionActionMapperService,
  ],
})
export class TransactionHandlerModule {}
