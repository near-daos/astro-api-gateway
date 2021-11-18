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
import { Dao, Policy, Role } from '@sputnik-v2/dao/entities';
import { Bounty, BountyClaim } from '@sputnik-v2/bounty/entities';
import { Token, NFTToken, NFTTokenMetadata } from '@sputnik-v2/token/entities';

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
    Policy,
    Role,
    Bounty,
    BountyClaim,
    Proposal,
    ProposalAction,
    Transaction,
    TransactionAction,
    Account,
    Receipt,
    ReceiptAction,
    AccountChange,
    Token,
    NFTToken,
    NFTTokenMetadata,
  ],
  synchronize: true,
  migrationsTableName: 'migration_table',
  migrations: ['migration/*.js'],
  cli: {
    migrationsDir: 'migration',
  },
  namingStrategy: new SnakeNamingStrategy(),
}));
