import { MigrationInterface, QueryRunner } from 'typeorm';

export class Error1660085153314 implements MigrationInterface {
  name = 'Error1660085153314';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "error" ("is_archived" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" text NOT NULL, "type" text NOT NULL, "status" text NOT NULL DEFAULT 'open', "reason" text NOT NULL, "metadata" jsonb, "timestamp" bigint, CONSTRAINT "PK_cd77c9331f0ee047b819a7abad1" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "error"`);
  }
}
