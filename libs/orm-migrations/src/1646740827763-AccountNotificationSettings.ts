import { MigrationInterface, QueryRunner } from 'typeorm';

export class AccountNotificationSettings1646740827763
  implements MigrationInterface
{
  name = 'AccountNotificationSettings1646740827763';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "token"`);
    await queryRunner.query(
      `ALTER TABLE "account" ADD "email" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "account" ADD "is_email_verified" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "account" ADD "phone_number" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "account" ADD "is_phone_verified" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "account" ADD "notifi_user_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "account" ADD "notifi_alert_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_notification_settings" ADD "enable_email" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_notification_settings" ADD "enable_sms" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_notification" ADD "is_email" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_notification" ADD "is_phone" boolean`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "email"`);
    await queryRunner.query(
      `ALTER TABLE "account" DROP COLUMN "is_email_verified"`,
    );
    await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "phone_number"`);
    await queryRunner.query(
      `ALTER TABLE "account" DROP COLUMN "is_phone_verified"`,
    );
    await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "notifi_id"`);
    await queryRunner.query(
      `ALTER TABLE "account" DROP COLUMN "notifi_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account" DROP COLUMN "notifi_alert_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account" ADD "token" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_notification_settings" DROP COLUMN "enable_email"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_notification_settings" DROP COLUMN "enable_sms"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_notification" DROP COLUMN "is_email"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_notification" DROP COLUMN "is_phone"`,
    );
  }
}
