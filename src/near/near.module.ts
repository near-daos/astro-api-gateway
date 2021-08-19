import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NEAR_INDEXER_DB_CONNECTION } from 'src/common/constants';
import { TypeOrmConfigService } from 'src/config';
import { nearProvider } from 'src/config/near';
import { nearSputnikProvider } from 'src/config/sputnik';
import { Account } from './entities/account.entity';
import { Receipt } from './entities/receipt.entity';
import { TransactionAction } from './entities/transaction-action.entity';
import { Transaction } from './entities/transaction.entity';
import { NearService } from './near.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      name: NEAR_INDEXER_DB_CONNECTION,
      useClass: TypeOrmConfigService,
    }),
    TypeOrmModule.forFeature([
      Account,
      Receipt,
      Transaction,
      TransactionAction
    ], NEAR_INDEXER_DB_CONNECTION)
  ],
  providers: [
    NearService,
    nearProvider,
    nearSputnikProvider
  ],
  exports: [
    NearService,
    nearProvider,
    nearSputnikProvider
  ]
})
export class NearModule {}
