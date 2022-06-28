import { registerAs } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import {
  TransactionAction,
  Transaction,
  Receipt,
  ReceiptAction,
  AccountChange,
} from '@sputnik-v2/near-indexer/entities';
import { Subscription } from '@sputnik-v2/subscription/entities';
import { Proposal, ProposalAction } from '@sputnik-v2/proposal/entities';
import { Account } from '@sputnik-v2/account/entities';
import { Dao, DaoVersion, Policy, Role } from '@sputnik-v2/dao/entities';
import {
  Bounty,
  BountyClaim,
  BountyContext,
} from '@sputnik-v2/bounty/entities';
import {
  Token,
  NFTToken,
  NFTTokenMetadata,
  TokenBalance,
  NFTContract,
} from '@sputnik-v2/token/entities';
import {
  AccountNotification,
  AccountNotificationSettings,
  Notification,
} from '@sputnik-v2/notification/entities';
import { Comment, CommentReport } from '@sputnik-v2/comment/entities';
import { DaoStats } from '@sputnik-v2/stats/entities';
import { DaoSettings } from '@sputnik-v2/dao-settings';
import { OTP } from '@sputnik-v2/otp';
import {
  ProposalTemplate,
  SharedProposalTemplate,
} from '@sputnik-v2/proposal-template/entities';
import { SharedProposalTemplateDao } from '@sputnik-v2/proposal-template/entities/shared-proposal-template-dao.entity';

export default registerAs('db_default', () => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10),
  database: process.env.DATABASE_NAME,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  entities: [
    Subscription,
    Dao,
    DaoVersion,
    DaoSettings,
    Policy,
    Role,
    Bounty,
    BountyClaim,
    BountyContext,
    Proposal,
    ProposalAction,
    Transaction,
    TransactionAction,
    Account,
    Receipt,
    ReceiptAction,
    AccountChange,
    Token,
    TokenBalance,
    NFTContract,
    NFTToken,
    NFTTokenMetadata,
    Notification,
    AccountNotification,
    AccountNotificationSettings,
    Comment,
    CommentReport,
    DaoStats,
    OTP,
    ProposalTemplate,
    SharedProposalTemplate,
    SharedProposalTemplateDao,
  ],
  synchronize: false,
  namingStrategy: new SnakeNamingStrategy(),
}));
