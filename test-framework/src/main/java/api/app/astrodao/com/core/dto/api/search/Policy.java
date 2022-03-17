package api.app.astrodao.com.core.dto.api.search;

import java.util.List;
import lombok.Data;

public @Data class Policy{
	private String daoId;
	private DefaultVotePolicy defaultVotePolicy;
	private String proposalPeriod;
	private String bountyBond;
	private List<RolesItem> roles;
	private String proposalBond;
	private String bountyForgivenessPeriod;
}