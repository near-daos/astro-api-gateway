import { MigrationInterface, QueryRunner } from 'typeorm';

export class SharedProposalTemplate1655205857156 implements MigrationInterface {
  name = 'SharedProposalTemplate1655205857156';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "shared_proposal_template" ("is_archived" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" text NOT NULL, "created_by" character varying NOT NULL, "name" character varying NOT NULL, "description" character varying, "dao_count" integer NOT NULL, "config" text NOT NULL, CONSTRAINT "PK_f584187febc28934aea84fe137b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "shared_proposal_template_dao" ("proposal_template_id" text NOT NULL, "dao_id" text NOT NULL, CONSTRAINT "PK_787ee611e80d7bde886bcf4a835" PRIMARY KEY ("proposal_template_id", "dao_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0df78e6a5f2ddbccd1bd190f31" ON "shared_proposal_template_dao" ("proposal_template_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_903d00fc4c2a086a53e45f927d" ON "shared_proposal_template_dao" ("dao_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_proposal_template_dao" ADD CONSTRAINT "FK_0df78e6a5f2ddbccd1bd190f310" FOREIGN KEY ("proposal_template_id") REFERENCES "shared_proposal_template"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_proposal_template_dao" ADD CONSTRAINT "FK_903d00fc4c2a086a53e45f927d2" FOREIGN KEY ("dao_id") REFERENCES "dao"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shared_proposal_template_dao" DROP CONSTRAINT "FK_903d00fc4c2a086a53e45f927d2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_proposal_template_dao" DROP CONSTRAINT "FK_0df78e6a5f2ddbccd1bd190f310"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_903d00fc4c2a086a53e45f927d"`);
    await queryRunner.query(`DROP INDEX "IDX_0df78e6a5f2ddbccd1bd190f31"`);
    await queryRunner.query(`DROP TABLE "shared_proposal_template_dao"`);
    await queryRunner.query(`DROP TABLE "shared_proposal_template"`);
  }
}
