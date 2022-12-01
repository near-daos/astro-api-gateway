import { MigrationInterface, QueryRunner } from 'typeorm';

export class SchemaRefactoring1669729951204 implements MigrationInterface {
  name = 'SchemaRefactoring1669729951204';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bounty" ALTER COLUMN "times" TYPE integer USING "times"::NUMERIC`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bounty" ALTER COLUMN "times" TYPE character varying USING "times"::VARCHAR`,
    );
  }
}
