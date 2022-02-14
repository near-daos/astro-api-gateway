import { MigrationInterface, QueryRunner } from 'typeorm';

export class PopulateProposalsPolicyLabel1644604142540
  implements MigrationInterface
{
  name = 'PopulateProposalsPolicyLabel1644604142540';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "proposal" SET "policy_label" = 'config' WHERE "type" = 'ChangeConfig' AND "policy_label" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "proposal" SET "policy_label" = 'policy' WHERE "type" = 'ChangePolicy' AND "policy_label" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "proposal" SET "policy_label" = 'add_member_to_role' WHERE "type" = 'AddMemberToRole' AND "policy_label" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "proposal" SET "policy_label" = 'remove_member_from_role' WHERE "type" = 'RemoveMemberFromRole' AND "policy_label" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "proposal" SET "policy_label" = 'call' WHERE "type" = 'FunctionCall' AND "policy_label" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "proposal" SET "policy_label" = 'upgrade_self' WHERE "type" = 'UpgradeSelf' AND "policy_label" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "proposal" SET "policy_label" = 'upgrade_remote' WHERE "type" = 'UpgradeRemote' AND "policy_label" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "proposal" SET "policy_label" = 'transfer' WHERE "type" = 'Transfer' AND "policy_label" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "proposal" SET "policy_label" = 'set_vote_token' WHERE "type" = 'SetStakingContract' AND "policy_label" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "proposal" SET "policy_label" = 'add_bounty' WHERE "type" = 'AddBounty' AND "policy_label" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "proposal" SET "policy_label" = 'bounty_done' WHERE "type" = 'BountyDone' AND "policy_label" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "proposal" SET "policy_label" = 'vote' WHERE "type" = 'Vote' AND "policy_label" IS NULL`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
