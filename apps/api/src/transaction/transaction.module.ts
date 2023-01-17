import { CacheModule, Module } from '@nestjs/common';
import { CacheConfigService } from '@sputnik-v2/config/cache';
import { DaoFundsModule } from '@sputnik-v2/dao-funds';
import { TransactionModule as TransactionModuleLib } from '@sputnik-v2/transaction';
import { NearIndexerModule } from '@sputnik-v2/near-indexer';

import { TransactionController } from './transaction.controller';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    NearIndexerModule,
    TransactionModuleLib,
    DaoFundsModule,
  ],
  controllers: [TransactionController],
})
export class TransactionModule {}
