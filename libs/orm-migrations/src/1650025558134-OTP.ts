import { MigrationInterface, QueryRunner } from 'typeorm';

export class OTP1650025558134 implements MigrationInterface {
  name = 'OTP1650025558134';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "otp" ("key" text NOT NULL, "hash" text NOT NULL, "created_at" bigint NOT NULL, "ttl" bigint NOT NULL, CONSTRAINT "PK_3ff62d3807bcfe578c2e6a2d04e" PRIMARY KEY ("key"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "otp"`);
  }
}
