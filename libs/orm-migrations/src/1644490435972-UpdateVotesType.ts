import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateVotesType1644490435972 implements MigrationInterface {
  name = 'UpdateVotesType1644490435972';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE proposal ALTER votes TYPE JSONB USING votes::JSONB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE proposal ALTER votes TYPE TEXT USING votes::TEXT`,
    );
  }
}
