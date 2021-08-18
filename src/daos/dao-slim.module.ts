import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NEAR_INDEXER_DB_CONNECTION } from 'src/common/constants';
import { TypeOrmConfigService } from 'src/config';
import { NearModule } from 'src/near/near.module';
import { DaoService } from './dao.service';
import { Dao } from './entities/dao.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dao]),
    TypeOrmModule.forRootAsync({
      name: NEAR_INDEXER_DB_CONNECTION,
      useClass: TypeOrmConfigService,
    }),
    NearModule
  ],
  providers: [DaoService],
  exports: [DaoService]
})
export class DaoSlimModule {}
