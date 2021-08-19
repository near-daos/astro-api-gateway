import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NearModule } from 'src/near/near.module';
import { DaoService } from './dao.service';
import { Dao } from './entities/dao.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dao]),
    NearModule
  ],
  providers: [DaoService],
  exports: [DaoService]
})
export class DaoSlimModule {}
