import { registerAs } from '@nestjs/config';
import { NEAR_INDEXER_DB_CONNECTION } from 'src/common/constants';
import {
  Account,
  AccessKey,
  Receipt,
  Transaction,
  TransactionAction
} from 'src/near/index';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export default registerAs(`db_${NEAR_INDEXER_DB_CONNECTION}`, () => ({
  type: 'postgres',
  host: process.env.NEAR_INDEXER_DATABASE_HOST,
  port: parseInt(process.env.NEAR_INDEXER_DATABASE_PORT, 10),
  database: process.env.NEAR_INDEXER_DATABASE_NAME,
  username: process.env.NEAR_INDEXER_DATABASE_USERNAME,
  password: process.env.NEAR_INDEXER_DATABASE_PASSWORD,
  entities: [
    Account,
    AccessKey,
    Receipt,
    Transaction,
    TransactionAction
  ],
  synchronize: false,
  namingStrategy: new SnakeNamingStrategy()
}));
