import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProposalTemplate1652095938431 implements MigrationInterface {
  name = 'ProposalTemplate1652095938431';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "proposal_template" ("is_archived" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" text NOT NULL, "dao_id" text NOT NULL, "name" character varying NOT NULL, "is_enabled" boolean NOT NULL, "config" text NOT NULL, CONSTRAINT "PK_bf60b0847d8b40437cc32dfc1b0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_template" ADD CONSTRAINT "FK_c547ea3567bf0ba46135c8e6c4d" FOREIGN KEY ("dao_id") REFERENCES "dao"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "proposal_template" DROP CONSTRAINT "FK_c547ea3567bf0ba46135c8e6c4d"`,
    );
    await queryRunner.query(`DROP TABLE "proposal_template"`);
  }
}
