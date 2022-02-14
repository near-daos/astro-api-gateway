import { MigrationInterface, QueryRunner } from 'typeorm';

export class SchemaRefactoring1644851458056 implements MigrationInterface {
  name = 'SchemaRefactoring1644851458056';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dao" ALTER COLUMN "config" TYPE JSONB USING "config"::JSONB`,
    );
    await queryRunner.query(
      `ALTER TABLE "dao" ALTER COLUMN "metadata" TYPE JSONB USING "metadata"::JSONB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dao" ALTER COLUMN "metadata" TYPE TEXT USING "metadata"::TEXT`,
    );
    await queryRunner.query(
      `ALTER TABLE "dao" ALTER COLUMN "config" TYPE TEXT USING "config"::TEXT`,
    );
  }
}
