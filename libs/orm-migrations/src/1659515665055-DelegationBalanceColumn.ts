import { MigrationInterface, QueryRunner } from 'typeorm';

export class DelegationBalanceColumn1659515665055
  implements MigrationInterface
{
  name = 'DelegationBalanceColumn1659515665055';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "delegation" ALTER COLUMN "balance" TYPE numeric(45)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "delegation" ALTER COLUMN "balance" TYPE bigint`,
    );
  }
}
