import { MigrationInterface, QueryRunner } from 'typeorm';

export class ActionRequiredNotificationSettings1661895064377
  implements MigrationInterface
{
  name = 'ActionRequiredNotificationSettings1661895064377';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account_notification_settings" ADD "action_required_only" boolean`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account_notification_settings" DROP COLUMN "action_required_only"`,
    );
  }
}
