import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DaoModule } from '@sputnik-v2/dao';
import { ProposalTemplate } from './entities';
import { ProposalTemplateService } from './proposal-template.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProposalTemplate]), DaoModule],
  providers: [ProposalTemplateService],
  exports: [ProposalTemplateService],
})
export class ProposalTemplateModule {}
