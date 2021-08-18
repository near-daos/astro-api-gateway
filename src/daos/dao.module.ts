import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DaoController } from './dao.controller';
import { DaoService } from './dao.service';
import { Dao } from './entities/dao.entity';
import { CacheConfigService, TypeOrmConfigService } from 'src/config';
import { NEAR_INDEXER_DB_CONNECTION } from 'src/common/constants';
import { NearModule } from 'src/near/near.module';
import { nearSputnikProvider } from 'src/config/sputnik';
import { nearProvider } from 'src/config/near';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    TypeOrmModule.forFeature([Dao]),
    TypeOrmModule.forRootAsync({
      name: NEAR_INDEXER_DB_CONNECTION,
      useClass: TypeOrmConfigService,
    }),
    NearModule
  ],
  providers: [
    DaoService,
    nearProvider,
    nearSputnikProvider
  ],
  controllers: [DaoController],
  exports: [DaoService]
})
export class DaoModule {}
