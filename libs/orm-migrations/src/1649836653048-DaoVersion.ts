import { MigrationInterface, QueryRunner } from 'typeorm';

export class DaoVersion1649836653048 implements MigrationInterface {
  name = 'DaoVersion1649836653048';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "dao_version" ("is_archived" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "hash" text NOT NULL, "version" character varying NOT NULL, "commit_id" character varying NOT NULL, "changelog_url" character varying, CONSTRAINT "PK_c7d3c77bf73fff5cf98bc29deac" PRIMARY KEY ("hash"))`,
    );
    await queryRunner.query(`ALTER TABLE "dao" ADD "dao_version_hash" text`);
    await queryRunner.query(
      `ALTER TABLE "dao" ADD CONSTRAINT "FK_6debd9a8b80dcb3e6e042fa12b2" FOREIGN KEY ("dao_version_hash") REFERENCES "dao_version"("hash") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dao" DROP CONSTRAINT "FK_6debd9a8b80dcb3e6e042fa12b2"`,
    );
    await queryRunner.query(`ALTER TABLE "dao" DROP COLUMN "dao_version_hash"`);
    await queryRunner.query(`DROP TABLE "dao_version"`);
  }
}
