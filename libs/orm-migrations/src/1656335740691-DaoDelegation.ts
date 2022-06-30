import { MigrationInterface, QueryRunner } from 'typeorm';

export class DaoDelegation1656335740691 implements MigrationInterface {
  name = 'SchemaRefactoring1656335740691';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "delegation" ("id" text NOT NULL, "dao_id" text NOT NULL, "account_id" character varying NOT NULL, "balance" character varying NOT NULL, CONSTRAINT "PK_a2cb6c9b942d68b109131beab44" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "delegation" ADD CONSTRAINT "FK_663b9afe165f13e72fde4b94fc5" FOREIGN KEY ("dao_id") REFERENCES "dao"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "delegation" DROP CONSTRAINT "FK_663b9afe165f13e72fde4b94fc5"`,
    );
    await queryRunner.query(`DROP TABLE "delegation"`);
  }
}
