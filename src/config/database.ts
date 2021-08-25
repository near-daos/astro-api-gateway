import { registerAs } from '@nestjs/config';
import { Dao } from 'src/daos/entities/dao.entity';
import { TransactionAction, Transaction } from 'src/near';
import { Subscription } from 'src/subscriptions/entities/subscription.entity';
import { Proposal } from 'src/proposals/entities/proposal.entity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Account } from 'src/account/entities/Account.entity';

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
    Proposal,
    Transaction,
    TransactionAction,
    Account
  ],
  synchronize: true,
  migrationsTableName: 'migration_table',
  migrations: ['migration/*.js'],
  cli: {
    migrationsDir: 'migration',
  },
  namingStrategy: new SnakeNamingStrategy(),
}));
