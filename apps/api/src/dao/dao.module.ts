import { CacheModule, Module } from '@nestjs/common';
import { DaoModule as DaoModuleLib } from '@sputnik-v2/dao';
import { NearIndexerModule } from '@sputnik-v2/near-indexer';
import { CacheConfigService } from '@sputnik-v2/config/api-config';

import { DaoController } from './dao.controller';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    NearIndexerModule,
    DaoModuleLib,
  ],
  controllers: [DaoController],
})
export class DaoModule {}
