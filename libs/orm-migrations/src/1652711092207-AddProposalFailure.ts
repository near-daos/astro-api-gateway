import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProposalFailure1652711092207 implements MigrationInterface {
  name = 'AddProposalFailure1652711092207';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "proposal" ADD "failure" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "proposal" DROP COLUMN "failure"`);
  }
}
