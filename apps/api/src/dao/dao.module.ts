import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DaoModule as DaoModuleLib, Dao, Policy, Role } from '@sputnik-v2/dao';
import { NearIndexerModule } from '@sputnik-v2/near-indexer';
import { CacheConfigService } from '@sputnik-v2/config/api-config';

import { DaoNearService } from './dao-near.service';
import { DaoController } from './dao.controller';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    TypeOrmModule.forFeature([Dao, Policy, Role]),
    NearIndexerModule,
    DaoModuleLib,
  ],
  providers: [DaoNearService],
  controllers: [DaoController],
  exports: [DaoNearService],
})
export class DaoModule {}
