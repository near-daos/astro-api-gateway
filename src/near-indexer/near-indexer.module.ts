import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NEAR_INDEXER_DB_CONNECTION } from 'src/common/constants';
import { TypeOrmConfigService } from 'src/config/aggregator-config';
import { nearProvider } from 'src/config/near';
import { nearTokenFactoryProvider } from 'src/config/near-token-factory';
import { nearApiProvider } from 'src/config/near-api';
import { AccountChange } from './entities/account-change.entity';
import { Account } from './entities/account.entity';
import { ActionReceiptAction } from './entities/action-receipt-action.entity';
import { ReceiptAction } from './entities/receipt-action.entity';
import { Receipt } from './entities/receipt.entity';
import { TransactionAction } from './entities/transaction-action.entity';
import { Transaction } from './entities/transaction.entity';
import { NearIndexerService } from './near-indexer.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      name: NEAR_INDEXER_DB_CONNECTION,
      useClass: TypeOrmConfigService,
    }),
    TypeOrmModule.forFeature(
      [
        Account,
        Receipt,
        Transaction,
        TransactionAction,
        ActionReceiptAction,
        ReceiptAction,
        AccountChange,
      ],
      NEAR_INDEXER_DB_CONNECTION,
    ),
  ],
  providers: [
    NearIndexerService,
    nearProvider,
    nearApiProvider,
    nearTokenFactoryProvider,
  ],
  exports: [
    NearIndexerService,
    nearProvider,
    nearApiProvider,
    nearTokenFactoryProvider,
  ],
})
export class NearIndexerModule {}
