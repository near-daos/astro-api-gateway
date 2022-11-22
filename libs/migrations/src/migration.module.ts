import { OpensearchModule } from 'nestjs-opensearch';

import { getConnection } from 'typeorm';
import { forwardRef, Module, OnApplicationShutdown } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Proposal, ProposalAction, ProposalModule } from '@sputnik-v2/proposal';
import { NearIndexerModule } from '@sputnik-v2/near-indexer';
import { NearApiModule } from '@sputnik-v2/near-api';
import { SputnikModule } from '@sputnik-v2/sputnikdao';
import { ConfigModule } from '@nestjs/config';
import configuration, {
  TypeOrmConfigService,
} from '@sputnik-v2/config/migration-config';
import {
  NFTContract,
  NFTToken,
  NFTTokenMetadata,
  Token,
  TokenBalance,
} from '@sputnik-v2/token';
import { Dao, DaoModule } from '@sputnik-v2/dao';
import {
  Bounty,
  BountyClaim,
  BountyContext,
  BountyModule,
} from '@sputnik-v2/bounty';
import {
  AccountNotification,
  AccountNotificationSettings,
  Notification,
} from '@sputnik-v2/notification';
import { Comment, CommentModule } from '@sputnik-v2/comment';
import {
  ProposalTemplate,
  ProposalTemplateModule,
  SharedProposalTemplate,
  SharedProposalTemplateDao,
} from '@sputnik-v2/proposal-template';
import { OpenSearchModule } from '@sputnik-v2/opensearch';
import { DRAFT_DB_CONNECTION } from '@sputnik-v2/common';
import {
  DraftProposal,
  DraftProposalHistory,
} from '@sputnik-v2/draft-proposal';
import { DraftComment } from '@sputnik-v2/draft-comment';
import { DynamodbModule } from '@sputnik-v2/dynamodb';
import { Account } from '@sputnik-v2/account';
import { DaoSettings } from '@sputnik-v2/dao-settings';
import { ErrorEntity } from '@sputnik-v2/error-tracker';
import { OTP } from '@sputnik-v2/otp';
import { DaoStats } from '@sputnik-v2/stats';
import { Subscription } from '@sputnik-v2/subscription';
import { TransactionHandlerState } from '@sputnik-v2/transaction-handler';

import migrationScripts from './scripts';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    TypeOrmModule.forFeature([
      Account,
      Dao,
      DaoStats,
      Token,
      BountyClaim,
      ProposalTemplate,
      Proposal,
      ProposalAction,
      SharedProposalTemplate,
      SharedProposalTemplateDao,
      Comment,
      Bounty,
      BountyContext,
      DaoSettings,
      ErrorEntity,
      AccountNotification,
      AccountNotificationSettings,
      Notification,
      OTP,
      Subscription,
      NFTContract,
      NFTToken,
      NFTTokenMetadata,
      Token,
      TokenBalance,
      TransactionHandlerState,
    ]),
    TypeOrmModule.forRootAsync({
      name: DRAFT_DB_CONNECTION,
      useClass: TypeOrmConfigService,
    }),
    TypeOrmModule.forFeature(
      [DraftProposal, DraftProposalHistory, DraftComment],
      DRAFT_DB_CONNECTION,
    ),
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
    forwardRef(() => DaoModule),
    ProposalModule,
    forwardRef(() => BountyModule),
    NearIndexerModule,
    NearApiModule,
    SputnikModule,
    CommentModule,
    ProposalTemplateModule,
    OpenSearchModule,
    DynamodbModule,
  ],
  providers: [...migrationScripts],
})
export class MigrationModule implements OnApplicationShutdown {
  async onApplicationShutdown() {
    await getConnection(DRAFT_DB_CONNECTION).close();
  }
}
