import { OpensearchModule } from 'nestjs-opensearch';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Proposal, ProposalModule } from '@sputnik-v2/proposal';
import { NearIndexerModule } from '@sputnik-v2/near-indexer';
import { NearApiModule } from '@sputnik-v2/near-api';
import { SputnikModule } from '@sputnik-v2/sputnikdao';
import { ConfigModule } from '@nestjs/config';
import configuration, {
  TypeOrmConfigService,
} from '@sputnik-v2/config/migration-config';
import { Token } from '@sputnik-v2/token';
import { Dao, DaoModule } from '@sputnik-v2/dao';
import { Bounty, BountyClaim, BountyModule } from '@sputnik-v2/bounty';
import { AccountNotificationSettings } from '@sputnik-v2/notification';
import { Comment, CommentModule } from '@sputnik-v2/comment';
import {
  ProposalTemplate,
  ProposalTemplateModule,
} from '@sputnik-v2/proposal-template';
import { OpenSearchModule } from '@sputnik-v2/opensearch';
import { DRAFT_DB_CONNECTION } from '@sputnik-v2/common';
import { DraftProposal } from '@sputnik-v2/draft-proposal';

import migrationScripts from './scripts';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    TypeOrmModule.forFeature([
      Dao,
      Token,
      BountyClaim,
      AccountNotificationSettings,
      ProposalTemplate,
      Proposal,
      Comment,
      Bounty,
    ]),
    TypeOrmModule.forRootAsync({
      name: DRAFT_DB_CONNECTION,
      useClass: TypeOrmConfigService,
    }),
    TypeOrmModule.forFeature([DraftProposal], DRAFT_DB_CONNECTION),
    ConfigModule.forRoot({
      isGlobal: true,
      load: configuration,
      envFilePath: ['.env.local', '.env'],
    }),
    OpensearchModule.forRootAsync({
      useFactory: () => ({
        node: process.env.OPENSEARCH_NODE_URL,
      }),
    }),
    DaoModule,
    ProposalModule,
    BountyModule,
    NearIndexerModule,
    NearApiModule,
    SputnikModule,
    CommentModule,
    ProposalTemplateModule,
    OpenSearchModule,
  ],
  providers: [...migrationScripts],
})
export class MigrationModule {}
