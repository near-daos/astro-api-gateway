import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DaoService } from './dao.service';
import { Dao } from './entities/dao.entity';
import { Policy } from './entities/policy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dao, Policy])],
  providers: [DaoService],
  exports: [DaoService],
})
export class DaoSlimModule {}
