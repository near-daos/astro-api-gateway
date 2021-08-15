import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NEAR_INDEXER_DB_CONNECTION } from 'src/common/constants';
import { Account } from './entities/account.entity';
import { Receipt } from './entities/receipt.entity';
import { TransactionAction } from './entities/transaction-action.entity';
import { Transaction } from './entities/transaction.entity';
import { NearService } from './near.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Account,
      Receipt,
      Transaction,
      TransactionAction
    ], NEAR_INDEXER_DB_CONNECTION)
  ],
  providers: [NearService],
  exports: [NearService]
})
export class NearModule {}
