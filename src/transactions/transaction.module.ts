import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheConfigService } from 'src/config/cache';
import { DaoService } from 'src/daos/dao.service';
import { Dao } from 'src/daos/entities/dao.entity';
import { Transaction, TransactionAction } from 'src/near';
import { NearModule } from 'src/near/near.module';
import { Proposal } from 'src/proposals/entities/proposal.entity';
import { ProposalService } from 'src/proposals/proposal.service';
import { SputnikDaoService } from 'src/sputnikdao/sputnik.service';
import { TokenFactoryService } from 'src/token-factory/token-factory.service';
import { Token } from 'src/tokens/entities/token.entity';
import { TokenService } from 'src/tokens/token.service';
import { SputnikTransactionService } from './sputnik-transaction.service';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    TypeOrmModule.forFeature([
      Transaction,
      TransactionAction,
      Dao,
      Proposal,
      Token,
    ]),
    NearModule,
  ],
  providers: [
    TransactionService,
    SputnikTransactionService,
    SputnikDaoService,
    DaoService,
    ProposalService,
    TokenFactoryService,
    TokenService,
  ],
  controllers: [TransactionController],
  exports: [TransactionService],
})
export class TransactionModule {}
