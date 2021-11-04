import { Module } from '@nestjs/common';

import { NearApiModule } from 'src/near-api/near-api.module';
import { DaoModule } from 'src/daos/dao.module';
import { ProposalModule } from 'src/proposals/proposal.module';
import { BountyModule } from 'src/bounties/bounty.module';

import { TransactionHandlerService } from './transaction-handler.service';
import { TransactionActionHandlerService } from './transaction-action-handler.service';
import { TransactionActionMapperService } from './transaction-action-mapper.service';

@Module({
  imports: [NearApiModule, DaoModule, ProposalModule, BountyModule],
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
