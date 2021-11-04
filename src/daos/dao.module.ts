import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DaoController } from './dao.controller';
import { DaoService } from './dao.service';
import { Dao } from './entities/dao.entity';
import { CacheConfigService } from 'src/config/api-config';
import { NearIndexerModule } from 'src/near-indexer/near-indexer.module';
import { Policy } from './entities/policy.entity';
import { Role } from './entities/role.entity';
import { DaoNearService } from './dao-near.service';
import { ProposalModule } from 'src/proposals/proposal.module';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    TypeOrmModule.forFeature([Dao, Policy, Role]),
    NearIndexerModule,
    ProposalModule,
  ],
  providers: [DaoService, DaoNearService],
  controllers: [DaoController],
  exports: [DaoService],
})
export class DaoModule {}
