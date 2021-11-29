import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProposalModule } from '@sputnik-v2/proposal';
import { NearIndexerModule } from '@sputnik-v2/near-indexer';
import { NearApiModule } from '@sputnik-v2/near-api';
import { SputnikDaoService } from '@sputnik-v2/sputnikdao';
import { ConfigModule } from '@nestjs/config';
import configuration, {
  TypeOrmConfigService,
} from '@sputnik-v2/config/aggregator-dao-config';
import { Token } from '@sputnik-v2/token';
import { Dao } from '@sputnik-v2/dao';
import { BountyClaim } from '@sputnik-v2/bounty';

import migrationScripts from './scripts';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    TypeOrmModule.forFeature([Dao, Token, BountyClaim]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: configuration,
      envFilePath: ['.env.local', '.env'],
    }),
    ProposalModule,
    NearIndexerModule,
    NearApiModule,
  ],
  providers: [SputnikDaoService, ...migrationScripts],
})
export class MigrationModule {}
