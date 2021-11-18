import { CacheModule, Module } from '@nestjs/common';
import { CacheConfigService } from '@sputnik-v2/config/cache';
import { TransactionModule as TransactionModuleLib } from '@sputnik-v2/transaction';
import { NearIndexerModule } from '@sputnik-v2/near-indexer';

import { TransactionController } from './transaction.controller';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    TransactionModuleLib,
    NearIndexerModule,
  ],
  controllers: [TransactionController],
})
export class TransactionModule {}
