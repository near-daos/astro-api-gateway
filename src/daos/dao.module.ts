import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DaoController } from './dao.controller';
import { DaoService } from './dao.service';
import { Dao } from './entities/dao.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dao])],
  providers: [DaoService],
  controllers: [DaoController],
  exports: [DaoService]
})
export class DaoModule {}
