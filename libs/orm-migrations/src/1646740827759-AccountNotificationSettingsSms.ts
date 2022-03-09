import { MigrationInterface, QueryRunner } from 'typeorm';

export class AccountNotificationSettingsSms1646740827759
  implements MigrationInterface
{
  name = 'AccountNotificationSettingsSms1646740827759';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account_notification_settings" ADD "phone_number" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_notification_settings" ADD "enable_sms" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_notification" ADD "phone_number" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account_notification_settings" DROP COLUMN "enable_sms"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_notification_settings" DROP COLUMN "phone_number"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_notification" DROP COLUMN "phone_number"`,
    );
  }
}
