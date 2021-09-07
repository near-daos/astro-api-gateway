import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proposal } from './entities/proposal.entity';
import { ProposalController } from './proposal.controller';
import { ProposalService } from './proposal.service';
import { CacheConfigService } from 'src/config';
import { ProposalOrmService } from './proposal-orm.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    TypeOrmModule.forFeature([Proposal]),
  ],
  providers: [ProposalService, ProposalOrmService],
  controllers: [ProposalController],
  exports: [ProposalService, ProposalOrmService],
})
export class ProposalModule {}
