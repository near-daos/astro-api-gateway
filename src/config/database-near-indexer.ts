import { registerAs } from '@nestjs/config';
import { NEAR_INDEXER_DB_CONNECTION } from 'src/common/constants';
import { Account } from 'src/near/entities/account.entity';
import { Receipt } from 'src/near/entities/receipt.entity';
import { TransactionAction } from 'src/near/entities/transaction-action.entity';
import { Transaction } from 'src/near/entities/transaction.entity';
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
    Receipt,
    Transaction,
    TransactionAction
  ],
  synchronize: false,
  namingStrategy: new SnakeNamingStrategy()
}));
