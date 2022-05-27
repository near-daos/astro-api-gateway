package api.app.astrodao.com.core;

import lombok.experimental.UtilityClass;

@UtilityClass
public class Constants {
	@UtilityClass
	public class CLICommands {
		public static final String CREATE_NEW_DAO = "near call sputnikv2.testnet create '%s' --account-id %s --gas %s --deposit %s";
		public static final String ADD_NEW_PROPOSAL = "near call %s add_proposal '%s' --account-id %s --gas %s --deposit %s";
		public static final String VOTE_FOR_PROPOSAL = "near call %s act_proposal '%s' --account-id %s --gas %s";

		public static final String GET_DAO_CONFIG = "near view %s get_config '{}'";
		public static final String GET_DAO_POLICY = "near view %s get_policy '{}'";
		public static final String GET_PROPOSAL_BY_ID = "near view %s get_proposal '%s'";
		public static final String GET_BOUNTY_BY_ID = "near view %s get_bounty '%s'";
		public static final String GET_TX_STATUS = "near tx-status %s --accountId %s";
	}

	@UtilityClass
	public class DisposableEmailParams {
		public static final String ACTION_PARAM = "action";
		public static final String GET_RANDOM_MAILBOX = "genRandomMailbox";
		public static final String GET_MESSAGES = "getMessages";
		public static final String READ_MESSAGE = "readMessage";
	}

	@UtilityClass
	public class Endpoints {
		public static final String DAOS = "/api/v1/daos";
		public static final String DAOS_ID = "/api/v1/daos/{id}";
		public static final String ACCOUNT_DAOS = "/api/v1/daos/account-daos/{accountId}";

		public static final String PROPOSALS = "/api/v1/proposals";
		public static final String PROPOSALS_ID = "/api/v1/proposals/{id}";

		public static final String COMMENTS = "/api/v1/comments";
		public static final String COMMENTS_ID = "/api/v1/comments/{id}";
		public static final String COMMENTS_REPORT = "/api/v1/comments/report";

		public static final String BOUNTIES = "/api/v1/bounties";
		public static final String BOUNTIES_ID = "/api/v1/bounties/{id}";
		public static final String BOUNTY_CONTEXTS = "/api/v1/bounty-contexts";

		public static final String TOKENS = "/api/v1/tokens";
		public static final String ACCOUNT_TOKENS = "/api/v1/tokens/account-tokens/{accountId}";
		public static final String TOKENS_NFTS = "/api/v1/tokens/nfts";
		public static final String TOKENS_NFTS_EVENTS = "/api/v1/tokens/nfts/{id}/events";

		public static final String NOTIFICATIONS = "/api/v1/notifications";
		public static final String NOTIFICATIONS_ID = "/api/v1/notifications/{id}";
		public static final String NOTIFICATIONS_SETTINGS = "/api/v1/notification-settings";
		public static final String ACCOUNT_NOTIFICATION_STATUS_ACCOUNT_ID = "/api/v1/account-notification-status/{accountId}";

		public static final String ACCOUNT_ID = "/api/v1/account/{id}";
		public static final String ACCOUNT_EMAIL = "/api/v1/account/email";
		public static final String ACCOUNT_EMAIL_SEND_VERIFICATION = "/api/v1/account/email/send-verification";
		public static final String ACCOUNT_EMAIL_VERIFY = "/api/v1/account/email/verify";

		public static final String SEARCH = "/api/v1/search";

		public static final String DAO_STATS_FUNDS = "/api/v1/stats/dao/{id}/funds";
		public static final String DAO_STATS_NFTS = "/api/v1/stats/dao/{id}/nfts";
		public static final String DAO_STATS_PROPOSALS = "/api/v1/stats/dao/{id}/proposals";
		public static final String DAO_STATS_STATE = "/api/v1/stats/dao/{id}/state";
		public static final String DAO_STATS_BOUNTIES = "/api/v1/stats/dao/{id}/bounties";

		public static final String SUBSCRIPTIONS = "/api/v1/subscriptions";
		public static final String SUBSCRIPTIONS_ID = "/api/v1/subscriptions/{id}";
		public static final String ACCOUNT_SUBSCRIPTIONS = "/api/v1/subscriptions/account-subscriptions/{accountId}";

		public static final String TRANSACTIONS_CALLBACK = "/api/v1/transactions/wallet/callback/{accountId}";
	}
}
