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
	}
}
