const SnakeNamingStrategy =
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('typeorm-naming-strategies').SnakeNamingStrategy;

module.exports = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: false,
  logging: false,
  namingStrategy: new SnakeNamingStrategy(),
  entities: [
    'libs/account/src/entities/**/*.ts',
    'libs/bounty/src/entities/**/*.ts',
    'libs/comment/src/entities/**/*.ts',
    'libs/dao/src/entities/**/*.ts',
    'libs/dao-settings/src/entities/**/*.ts',
    'libs/near-indexer/src/entities/account-change.entity.ts',
    'libs/near-indexer/src/entities/transaction.entity.ts',
    'libs/near-indexer/src/entities/transaction-action.entity.ts',
    'libs/near-indexer/src/entities/receipt.entity.ts',
    'libs/near-indexer/src/entities/receipt-action.entity.ts',
    'libs/notification/src/entities/**/*.ts',
    'libs/proposal/src/entities/**/*.ts',
    'libs/proposal-template/src/entities/**/*.ts',
    'libs/stats/src/entities/**/*.ts',
    'libs/subscription/src/entities/**/*.ts',
    'libs/token/src/entities/**/*.ts',
    'libs/otp/src/entities/**/*.ts',
    'libs/transaction-handler/src/entities/**/*.ts',
    'libs/error-tracker/src/entities/**/*.ts',
  ],
  migrations: ['libs/orm-migrations/src/**/*.ts'],
  cli: {
    migrationsDir: 'libs/orm-migrations/src',
  },
};
