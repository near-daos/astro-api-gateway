import { MigrationInterface, QueryRunner } from 'typeorm';

export class TransactionHandlerState1657196370747
  implements MigrationInterface
{
  name = 'TransactionHandlerState1657196370747';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "transaction_handler_state" ("id" text NOT NULL, "last_block_timestamp" bigint NOT NULL, "last_block_hash" character varying NOT NULL, CONSTRAINT "PK_9a1b358f1e5c32d0e62cc847c5c" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "transaction_handler_state"`);
  }
}
