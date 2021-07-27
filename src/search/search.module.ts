import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DaoModule } from 'src/daos/dao.module';
import { Dao } from 'src/daos/entities/dao.entity';
import { Proposal } from 'src/proposals/entities/proposal.entity';
import { ProposalModule } from 'src/proposals/proposal.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Proposal]),
    TypeOrmModule.forFeature([Dao]),
    DaoModule,
    ProposalModule
  ],
  providers: [SearchService],
  controllers: [SearchController],
  exports: [SearchService]
})
export class SearchModule {}
