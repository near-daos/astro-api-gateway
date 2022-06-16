import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProposalModule } from '@sputnik-v2/proposal';
import { NearIndexerModule } from '@sputnik-v2/near-indexer';
import { NearApiModule } from '@sputnik-v2/near-api';
import { SputnikModule } from '@sputnik-v2/sputnikdao';
import { ConfigModule } from '@nestjs/config';
import configuration, {
  TypeOrmConfigService,
} from '@sputnik-v2/config/aggregator-config';
import { Token } from '@sputnik-v2/token';
import { Dao, DaoModule } from '@sputnik-v2/dao';
import { BountyClaim, BountyModule } from '@sputnik-v2/bounty';
import { AccountNotificationSettings } from '@sputnik-v2/notification';
import { CommentModule } from '@sputnik-v2/comment';

import migrationScripts from './scripts';
import {
  ProposalTemplate,
  ProposalTemplateModule,
} from '@sputnik-v2/proposal-template';

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
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: configuration,
      envFilePath: ['.env.local', '.env'],
    }),
    DaoModule,
    ProposalModule,
    BountyModule,
    NearIndexerModule,
    NearApiModule,
    SputnikModule,
    CommentModule,
    ProposalTemplateModule,
  ],
  providers: [...migrationScripts],
})
export class MigrationModule {}
