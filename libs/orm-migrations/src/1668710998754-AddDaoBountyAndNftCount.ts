import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDaoBountyAndNftCount1668710998754
  implements MigrationInterface
{
  name = 'AddDaoBountyAndNftCount1668710998754';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dao" ADD "bounty_count" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "dao" ADD "nft_count" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "dao" DROP COLUMN "nft_count"`);
    await queryRunner.query(`ALTER TABLE "dao" DROP COLUMN "bounty_count"`);
  }
}
