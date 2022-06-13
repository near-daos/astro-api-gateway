import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateProposalStatus1652369087456 implements MigrationInterface {
  name = 'UpdateProposalStatus1652369087456';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "proposal_status_enum" RENAME TO "proposal_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "proposal_status_enum" AS ENUM('InProgress', 'Approved', 'Rejected', 'Removed', 'Expired', 'Moved', 'Failed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal" ALTER COLUMN "status" TYPE "proposal_status_enum" USING "status"::"text"::"proposal_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal" ALTER COLUMN "status" SET DEFAULT 'InProgress'`,
    );
    await queryRunner.query(`DROP TYPE "proposal_status_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "proposal_status_enum_old" AS ENUM('InProgress', 'Approved', 'Rejected', 'Removed', 'Expired', 'Moved')`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal" ALTER COLUMN "status" TYPE "proposal_status_enum_old" USING "status"::"text"::"proposal_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal" ALTER COLUMN "status" SET DEFAULT 'InProgress'`,
    );
    await queryRunner.query(`DROP TYPE "proposal_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "proposal_status_enum_old" RENAME TO "proposal_status_enum"`,
    );
  }
}
