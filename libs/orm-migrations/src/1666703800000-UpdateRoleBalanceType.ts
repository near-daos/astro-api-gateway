import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateRoleBalanceType1666703800000 implements MigrationInterface {
  name = 'UpdateRoleBalanceType1666703800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE role ALTER COLUMN balance TYPE TEXT USING balance::TEXT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE role ALTER COLUMN balance TYPE BIGINT USING balance::BIGINT`,
    );
  }
}
