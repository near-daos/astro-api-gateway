import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1644442121519 implements MigrationInterface {
  name = 'InitialSchema1644442121519';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "account" ("is_archived" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "account_id" text NOT NULL, "token" character varying NOT NULL, CONSTRAINT "PK_ea08b54a9d7322975ffc57fc612" PRIMARY KEY ("account_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "role" ("is_archived" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" text NOT NULL, "name" character varying NOT NULL, "kind" character varying NOT NULL, "balance" bigint, "account_ids" text array, "permissions" text array NOT NULL, "vote_policy" text, "policy_dao_id" text, CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "policy" ("is_archived" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "dao_id" text NOT NULL, "proposal_bond" character varying NOT NULL, "bounty_bond" character varying NOT NULL, "proposal_period" bigint NOT NULL, "bounty_forgiveness_period" bigint NOT NULL, "default_vote_policy" text NOT NULL, CONSTRAINT "PK_f23cfc113deeaf13555a3cdfead" PRIMARY KEY ("dao_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "dao" ("is_archived" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "transaction_hash" character varying, "update_transaction_hash" character varying, "create_timestamp" bigint, "update_timestamp" bigint, "id" text NOT NULL, "config" text NOT NULL, "metadata" text, "amount" numeric NOT NULL, "total_supply" character varying NOT NULL, "last_bounty_id" integer NOT NULL, "last_proposal_id" integer NOT NULL, "staking_contract" character varying NOT NULL, "number_of_associates" integer, "number_of_members" integer, "number_of_groups" integer, "council" text array NOT NULL, "account_ids" text array, "council_seats" integer NOT NULL, "link" character varying, "description" character varying, "created_by" character varying, "status" text, "active_proposal_count" integer NOT NULL DEFAULT '0', "total_proposal_count" integer NOT NULL DEFAULT '0', "total_dao_funds" double precision NOT NULL DEFAULT '0', CONSTRAINT "REL_4daffbc13cc700ca118098230a" UNIQUE ("id"), CONSTRAINT "PK_4daffbc13cc700ca118098230a9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "comment_report" ("is_archived" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" text NOT NULL, "comment_id" integer NOT NULL, "account_id" character varying NOT NULL, "reason" character varying NOT NULL, CONSTRAINT "PK_6c4ddf5b4b438eff30ef1bf1fad" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "comment" ("is_archived" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "dao_id" character varying NOT NULL, "proposal_id" character varying, "context_id" character varying, "context_type" text, "account_id" character varying NOT NULL, "message" character varying NOT NULL, CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "bounty_context" ("is_archived" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" text NOT NULL, "dao_id" character varying NOT NULL, CONSTRAINT "REL_085fc106aa13666d72a6fcca1b" UNIQUE ("id"), CONSTRAINT "PK_085fc106aa13666d72a6fcca1b7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "proposal_action_action_enum" AS ENUM('AddProposal', 'RemoveProposal', 'VoteApprove', 'VoteReject', 'VoteRemove', 'Finalize', 'MoveToHub')`,
    );
    await queryRunner.query(
      `CREATE TABLE "proposal_action" ("id" text NOT NULL, "proposal_id" text NOT NULL, "account_id" character varying NOT NULL, "action" "proposal_action_action_enum", "transaction_hash" character varying, "timestamp" bigint, CONSTRAINT "PK_c44bd6250cf241ddd15782e8b55" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "proposal_status_enum" AS ENUM('InProgress', 'Approved', 'Rejected', 'Removed', 'Expired', 'Moved')`,
    );
    await queryRunner.query(
      `CREATE TYPE "proposal_vote_status_enum" AS ENUM('Active', 'Expired')`,
    );
    await queryRunner.query(
      `CREATE TYPE "proposal_type_enum" AS ENUM('ChangeConfig', 'ChangePolicy', 'AddMemberToRole', 'RemoveMemberFromRole', 'FunctionCall', 'UpgradeSelf', 'UpgradeRemote', 'Transfer', 'SetStakingContract', 'AddBounty', 'BountyDone', 'Vote')`,
    );
    await queryRunner.query(
      `CREATE TYPE "proposal_policy_label_enum" AS ENUM('config', 'policy', 'add_member_to_role', 'remove_member_from_role', 'call', 'upgrade_self', 'upgrade_remote', 'transfer', 'set_vote_token', 'add_bounty', 'bounty_done', 'vote')`,
    );
    await queryRunner.query(
      `CREATE TABLE "proposal" ("is_archived" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "transaction_hash" character varying, "update_transaction_hash" character varying, "create_timestamp" bigint, "update_timestamp" bigint, "id" text NOT NULL, "proposal_id" integer NOT NULL, "dao_id" text NOT NULL, "proposer" character varying NOT NULL, "description" character varying NOT NULL, "status" "proposal_status_enum" NOT NULL DEFAULT 'InProgress', "vote_status" "proposal_vote_status_enum", "kind" text NOT NULL, "type" "proposal_type_enum" NOT NULL, "policy_label" "proposal_policy_label_enum", "submission_time" bigint NOT NULL, "vote_counts" text NOT NULL, "votes" text NOT NULL, "vote_period_end" bigint, "bounty_done_id" text, "bounty_claim_id" character varying, CONSTRAINT "PK_ca872ecfe4fef5720d2d39e4275" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "bounty" ("is_archived" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "transaction_hash" character varying, "update_transaction_hash" character varying, "create_timestamp" bigint, "update_timestamp" bigint, "id" text NOT NULL, "bounty_id" integer NOT NULL, "proposal_id" text, "dao_id" text NOT NULL, "description" character varying NOT NULL, "token" character varying NOT NULL, "amount" character varying NOT NULL, "times" character varying NOT NULL, "max_deadline" character varying NOT NULL, "number_of_claims" integer NOT NULL, CONSTRAINT "UQ_bf282786794c8b1ba127e3110f6" UNIQUE ("proposal_id"), CONSTRAINT "REL_bf282786794c8b1ba127e3110f" UNIQUE ("proposal_id"), CONSTRAINT "PK_afc9754b790b0effd1d59257f4d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "bounty_claim" ("is_archived" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "transaction_hash" character varying, "update_transaction_hash" character varying, "create_timestamp" bigint, "update_timestamp" bigint, "id" text NOT NULL, "account_id" character varying NOT NULL, "start_time" character varying NOT NULL, "deadline" character varying NOT NULL, "completed" boolean NOT NULL, "end_time" character varying, "bounty_id" text, CONSTRAINT "PK_c53d842f56dd744f306d2685f5f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "dao_settings" ("is_archived" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "dao_id" text NOT NULL, "settings" text NOT NULL, CONSTRAINT "PK_56b5d9e2f9b2ad035b27b96fddb" PRIMARY KEY ("dao_id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "action_receipt_actions_action_kind_enum" AS ENUM('CREATE_ACCOUNT', 'DEPLOY_CONTRACT', 'FUNCTION_CALL', 'TRANSFER', 'STAKE', 'ADD_KEY', 'DELETE_KEY', 'DELETE_ACCOUNT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "action_receipt_actions" ("receipt_id" character varying NOT NULL, "index_in_action_receipt" integer NOT NULL, "receipt_predecessor_account_id" character varying NOT NULL, "receipt_receiver_account_id" character varying NOT NULL, "action_kind" "action_receipt_actions_action_kind_enum" NOT NULL, "args" text NOT NULL, CONSTRAINT "PK_a911bb227e9ca404181b2e14fc5" PRIMARY KEY ("receipt_id", "index_in_action_receipt"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "transaction_actions_action_kind_enum" AS ENUM('CREATE_ACCOUNT', 'DEPLOY_CONTRACT', 'FUNCTION_CALL', 'TRANSFER', 'STAKE', 'ADD_KEY', 'DELETE_KEY', 'DELETE_ACCOUNT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "transaction_actions" ("transaction_hash" character varying NOT NULL, "index_in_transaction" integer NOT NULL, "action_kind" "transaction_actions_action_kind_enum" NOT NULL, "args" jsonb, CONSTRAINT "PK_c5aa8731e8712ec225324e3ece0" PRIMARY KEY ("transaction_hash"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "transactions_status_enum" AS ENUM('UNKNOWN', 'FAILURE', 'SUCCESS_VALUE', 'SUCCESS_RECEIPT_ID')`,
    );
    await queryRunner.query(
      `CREATE TABLE "transactions" ("transaction_hash" character varying NOT NULL, "included_in_block_hash" character varying NOT NULL, "included_in_chunk_hash" character varying NOT NULL, "index_in_chunk" integer NOT NULL, "receiver_account_id" character varying NOT NULL, "signer_account_id" character varying NOT NULL, "signer_public_key" character varying NOT NULL, "nonce" bigint NOT NULL, "signature" character varying NOT NULL, "status" "transactions_status_enum" NOT NULL, "converted_into_receipt_id" character varying NOT NULL, "receipt_conversion_gas_burnt" character varying NOT NULL, "receipt_conversion_tokens_burnt" character varying NOT NULL, "block_timestamp" bigint NOT NULL, CONSTRAINT "REL_b53cfe42d3c5c88fe715b9432b" UNIQUE ("transaction_hash"), CONSTRAINT "PK_b53cfe42d3c5c88fe715b9432ba" PRIMARY KEY ("transaction_hash"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "receipts" ("receipt_id" character varying NOT NULL, "predecessor_account_id" character varying NOT NULL, "receiver_account_id" character varying NOT NULL, "originated_from_transaction_hash" character varying NOT NULL, "included_in_block_timestamp" bigint NOT NULL, CONSTRAINT "PK_8613250be825686eb9bf90189b7" PRIMARY KEY ("receipt_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "account_changes" ("id" character varying NOT NULL, "affected_account_id" character varying NOT NULL, "caused_by_transaction_hash" character varying, "changed_in_block_timestamp" bigint NOT NULL, "caused_by_receipt_id" character varying, CONSTRAINT "REL_4306755e44313b3514a2af2a4c" UNIQUE ("caused_by_receipt_id"), CONSTRAINT "PK_a653dacb3fa914a28f5b00ee0fd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "account_notification_settings" ("is_archived" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" text NOT NULL, "account_id" character varying NOT NULL, "dao_id" character varying, "types" text array NOT NULL, "muted_until_timestamp" bigint, "is_all_muted" boolean NOT NULL, CONSTRAINT "PK_6aed8e9ac05a0dc41679df7ad4a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "notification" ("is_archived" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" text NOT NULL, "dao_id" text NOT NULL, "target_id" character varying NOT NULL, "signer_id" character varying, "type" text NOT NULL, "status" text, "metadata" text NOT NULL, "timestamp" bigint, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "account_notification" ("is_archived" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" text NOT NULL, "notification_id" text NOT NULL, "account_id" character varying NOT NULL, "is_muted" boolean NOT NULL, "is_read" boolean NOT NULL, CONSTRAINT "PK_2e494e8baf5d322e4c57b251eea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "dao_stats" ("is_archived" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" text NOT NULL, "dao_id" character varying NOT NULL, "timestamp" bigint NOT NULL, "total_dao_funds" double precision, "transactions_count" integer, "bounty_count" integer, "nft_count" integer, "active_proposal_count" integer, "total_proposal_count" integer, CONSTRAINT "PK_b7e39a2dc2b04c801d02b5ac24c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a8291843e9c04efabea14d6726" ON "dao_stats" ("dao_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "subscription" ("is_archived" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" text NOT NULL, "account_id" character varying NOT NULL, "dao_id" text NOT NULL, CONSTRAINT "PK_8c3e00ebd02103caa1174cd5d9d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "nft_contract" ("id" text NOT NULL, "spec" character varying, "name" character varying, "symbol" character varying, "icon" character varying, "base_uri" character varying, "reference" character varying, "reference_hash" character varying, CONSTRAINT "PK_9191862f0721ccbaf709cf6cbc1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "nft_token_metadata" ("token_id" text NOT NULL, "copies" integer, "description" character varying, "expires_at" character varying, "extra" character varying, "issued_at" character varying, "media" character varying, "media_hash" character varying, "reference" character varying, "reference_hash" character varying, "starts_at" character varying, "title" character varying, "updated_at" character varying, "approved_account_ids" text array, "tokenId" text, CONSTRAINT "REL_538153b6968d3f555104fd4445" UNIQUE ("tokenId"), CONSTRAINT "PK_8f71d5e60dbecc53e8e11520701" PRIMARY KEY ("token_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "nft_token" ("is_archived" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "transaction_hash" character varying, "update_transaction_hash" character varying, "create_timestamp" bigint, "update_timestamp" bigint, "id" text NOT NULL, "owner_id" character varying NOT NULL, "token_id" character varying, "account_id" character varying, "minter" character varying, "contract_id" text, CONSTRAINT "PK_7e215df412b248db3731737290e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "token_balance" ("id" text NOT NULL, "token_id" text NOT NULL, "account_id" character varying NOT NULL, "balance" character varying NOT NULL, CONSTRAINT "PK_dc23ea262a0188977523d90ae7f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "token" ("is_archived" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "transaction_hash" character varying, "update_transaction_hash" character varying, "create_timestamp" bigint, "update_timestamp" bigint, "id" text NOT NULL, "owner_id" character varying NOT NULL, "total_supply" character varying NOT NULL, "decimals" integer NOT NULL, "icon" character varying, "name" character varying, "reference" character varying, "reference_hash" character varying, "spec" character varying, "symbol" character varying, "price" character varying, CONSTRAINT "PK_82fae97f905930df5d62a702fc9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "role" ADD CONSTRAINT "FK_53048a7154e8741f547eccda643" FOREIGN KEY ("policy_dao_id") REFERENCES "policy"("dao_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dao" ADD CONSTRAINT "UQ_4daffbc13cc700ca118098230a9" UNIQUE ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "dao" ADD CONSTRAINT "FK_4daffbc13cc700ca118098230a9" FOREIGN KEY ("id") REFERENCES "policy"("dao_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_report" ADD CONSTRAINT "FK_a9c67256ef74f6639eaef698833" FOREIGN KEY ("comment_id") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bounty_context" ADD CONSTRAINT "UQ_085fc106aa13666d72a6fcca1b7" UNIQUE ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "bounty_context" ADD CONSTRAINT "FK_085fc106aa13666d72a6fcca1b7" FOREIGN KEY ("id") REFERENCES "proposal"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action" ADD CONSTRAINT "FK_ac8a482f4b80a3f4254739d334b" FOREIGN KEY ("proposal_id") REFERENCES "proposal"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal" ADD CONSTRAINT "FK_f0dcd6b4180adeafcf5bf2cc8c1" FOREIGN KEY ("dao_id") REFERENCES "dao"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal" ADD CONSTRAINT "FK_5d9cb3bdefcbee3cebd21e0eb77" FOREIGN KEY ("bounty_done_id") REFERENCES "bounty"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bounty" ADD CONSTRAINT "FK_519b98cc2e7cd575db2d85ac38b" FOREIGN KEY ("dao_id") REFERENCES "dao"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bounty" ADD CONSTRAINT "FK_bf282786794c8b1ba127e3110f6" FOREIGN KEY ("proposal_id") REFERENCES "bounty_context"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bounty_claim" ADD CONSTRAINT "FK_7ba05b97f63f5bc360af56f6d3f" FOREIGN KEY ("bounty_id") REFERENCES "bounty"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "UQ_b53cfe42d3c5c88fe715b9432ba" UNIQUE ("transaction_hash")`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_b53cfe42d3c5c88fe715b9432ba" FOREIGN KEY ("transaction_hash") REFERENCES "transaction_actions"("transaction_hash") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "receipts" ADD CONSTRAINT "FK_93d128dee44b66d36cadb92628a" FOREIGN KEY ("originated_from_transaction_hash") REFERENCES "transactions"("transaction_hash") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_changes" ADD CONSTRAINT "FK_4306755e44313b3514a2af2a4ca" FOREIGN KEY ("caused_by_receipt_id") REFERENCES "receipts"("receipt_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_fb4bd640547574cfd78255d3ac8" FOREIGN KEY ("dao_id") REFERENCES "dao"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_notification" ADD CONSTRAINT "FK_5e792fbeca9b6a6551f3ef32fcf" FOREIGN KEY ("notification_id") REFERENCES "notification"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD CONSTRAINT "FK_599525af608de9f1786751cf8af" FOREIGN KEY ("dao_id") REFERENCES "dao"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_token_metadata" ADD CONSTRAINT "FK_538153b6968d3f555104fd4445c" FOREIGN KEY ("tokenId") REFERENCES "nft_token"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_token" ADD CONSTRAINT "FK_37818a997a720f8ff48edd3273d" FOREIGN KEY ("contract_id") REFERENCES "nft_contract"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "token_balance" ADD CONSTRAINT "FK_5813c3040e74c285719679c6935" FOREIGN KEY ("token_id") REFERENCES "token"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "token_balance" DROP CONSTRAINT "FK_5813c3040e74c285719679c6935"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_token" DROP CONSTRAINT "FK_37818a997a720f8ff48edd3273d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_token_metadata" DROP CONSTRAINT "FK_538153b6968d3f555104fd4445c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP CONSTRAINT "FK_599525af608de9f1786751cf8af"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_notification" DROP CONSTRAINT "FK_5e792fbeca9b6a6551f3ef32fcf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_fb4bd640547574cfd78255d3ac8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_changes" DROP CONSTRAINT "FK_4306755e44313b3514a2af2a4ca"`,
    );
    await queryRunner.query(
      `ALTER TABLE "receipts" DROP CONSTRAINT "FK_93d128dee44b66d36cadb92628a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_b53cfe42d3c5c88fe715b9432ba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bounty_claim" DROP CONSTRAINT "FK_7ba05b97f63f5bc360af56f6d3f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bounty" DROP CONSTRAINT "FK_bf282786794c8b1ba127e3110f6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bounty" DROP CONSTRAINT "FK_519b98cc2e7cd575db2d85ac38b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal" DROP CONSTRAINT "FK_5d9cb3bdefcbee3cebd21e0eb77"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal" DROP CONSTRAINT "FK_f0dcd6b4180adeafcf5bf2cc8c1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action" DROP CONSTRAINT "FK_ac8a482f4b80a3f4254739d334b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bounty_context" DROP CONSTRAINT "FK_085fc106aa13666d72a6fcca1b7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_report" DROP CONSTRAINT "FK_a9c67256ef74f6639eaef698833"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dao" DROP CONSTRAINT "FK_4daffbc13cc700ca118098230a9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role" DROP CONSTRAINT "FK_53048a7154e8741f547eccda643"`,
    );
    await queryRunner.query(`DROP TABLE "token"`);
    await queryRunner.query(`DROP TABLE "token_balance"`);
    await queryRunner.query(`DROP TABLE "nft_token"`);
    await queryRunner.query(`DROP TABLE "nft_token_metadata"`);
    await queryRunner.query(`DROP TABLE "nft_contract"`);
    await queryRunner.query(`DROP TABLE "subscription"`);
    await queryRunner.query(`DROP INDEX "IDX_a8291843e9c04efabea14d6726"`);
    await queryRunner.query(`DROP TABLE "dao_stats"`);
    await queryRunner.query(`DROP TABLE "account_notification"`);
    await queryRunner.query(`DROP TABLE "notification"`);
    await queryRunner.query(`DROP TABLE "account_notification_settings"`);
    await queryRunner.query(`DROP TABLE "account_changes"`);
    await queryRunner.query(`DROP TABLE "receipts"`);
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TYPE "transactions_status_enum"`);
    await queryRunner.query(`DROP TABLE "transaction_actions"`);
    await queryRunner.query(`DROP TYPE "transaction_actions_action_kind_enum"`);
    await queryRunner.query(`DROP TABLE "action_receipt_actions"`);
    await queryRunner.query(
      `DROP TYPE "action_receipt_actions_action_kind_enum"`,
    );
    await queryRunner.query(`DROP TABLE "dao_settings"`);
    await queryRunner.query(`DROP TABLE "bounty_claim"`);
    await queryRunner.query(`DROP TABLE "bounty"`);
    await queryRunner.query(`DROP TABLE "proposal"`);
    await queryRunner.query(`DROP TYPE "proposal_policy_label_enum"`);
    await queryRunner.query(`DROP TYPE "proposal_type_enum"`);
    await queryRunner.query(`DROP TYPE "proposal_vote_status_enum"`);
    await queryRunner.query(`DROP TYPE "proposal_status_enum"`);
    await queryRunner.query(`DROP TABLE "proposal_action"`);
    await queryRunner.query(`DROP TYPE "proposal_action_action_enum"`);
    await queryRunner.query(`DROP TABLE "bounty_context"`);
    await queryRunner.query(`DROP TABLE "comment"`);
    await queryRunner.query(`DROP TABLE "comment_report"`);
    await queryRunner.query(`DROP TABLE "dao"`);
    await queryRunner.query(`DROP TABLE "policy"`);
    await queryRunner.query(`DROP TABLE "role"`);
    await queryRunner.query(`DROP TABLE "account"`);
  }
}
