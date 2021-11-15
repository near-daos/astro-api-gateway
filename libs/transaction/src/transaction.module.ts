import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheService } from '@sputnik-v2/cache';
import { Transaction } from '@sputnik-v2/near-indexer';
import { TransactionHandlerModule } from '@sputnik-v2/transaction-handler';
import { CacheConfigService } from '@sputnik-v2/config/cache';

import { TransactionService } from './transaction.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    TypeOrmModule.forFeature([Transaction]),
    TransactionHandlerModule,
  ],
  providers: [TransactionService, CacheService],
  exports: [TransactionService],
})
export class TransactionModule {}
