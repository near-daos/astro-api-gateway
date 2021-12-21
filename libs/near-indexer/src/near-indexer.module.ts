import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NEAR_INDEXER_DB_CONNECTION } from '@sputnik-v2/common';
import { TypeOrmConfigService } from '@sputnik-v2/config/aggregator-config';
import { nearProvider } from '@sputnik-v2/config/near';
import { nearTokenFactoryProvider } from '@sputnik-v2/config/near-token-factory';
import { nearApiProvider } from '@sputnik-v2/config/near-api';

import {
  AccountChange,
  Account,
  ActionReceiptAction,
  ReceiptAction,
  Receipt,
  TransactionAction,
  Transaction,
  AssetsNftEvent,
} from './entities';
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
        AssetsNftEvent,
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
