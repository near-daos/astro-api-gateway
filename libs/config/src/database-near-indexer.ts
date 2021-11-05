import { registerAs } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { NEAR_INDEXER_DB_CONNECTION } from '@sputnik-v2/common';
import {
  AccountChange,
  ReceiptAction,
  Account,
  Receipt,
  Transaction,
  TransactionAction,
  ActionReceiptAction,
} from '@sputnik-v2/near-indexer/entities';

export default registerAs(`db_${NEAR_INDEXER_DB_CONNECTION}`, () => ({
  type: 'postgres',
  host: process.env.NEAR_INDEXER_DATABASE_HOST,
  port: parseInt(process.env.NEAR_INDEXER_DATABASE_PORT, 10),
  database: process.env.NEAR_INDEXER_DATABASE_NAME,
  username: process.env.NEAR_INDEXER_DATABASE_USERNAME,
  password: process.env.NEAR_INDEXER_DATABASE_PASSWORD,
  entities: [
    Account,
    Receipt,
    ReceiptAction,
    Transaction,
    TransactionAction,
    ActionReceiptAction,
    AccountChange,
  ],
  synchronize: false,
  namingStrategy: new SnakeNamingStrategy(),
}));
