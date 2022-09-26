import { MigrationInterface, QueryRunner } from 'typeorm';

export class CommentsCount1664149606873 implements MigrationInterface {
  name = 'CommentsCount1664149606873';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bounty_context" ADD "comments_count" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal" ADD "comments_count" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "proposal" DROP COLUMN "comments_count"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bounty_context" DROP COLUMN "comments_count"`,
    );
  }
}
