import { MigrationInterface, QueryRunner } from 'typeorm';

export class DaoStatsAddAmountColumn1673615176877
  implements MigrationInterface
{
  name = 'DaoStatsAddAmountColumn1673615176877';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "dao_stats" ADD "amount" numeric`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "dao_stats" DROP COLUMN "amount"`);
  }
}
