package api.app.astrodao.com.core.dto.newsearch.response;

import lombok.Data;

import java.util.List;

@Data
public class Policy {
	private String proposalPeriod;
	private String bountyBond;
	private DefaultVotePolicy defaultVotePolicy;
	private List<RolesItem> roles;
	private String proposalBond;
	private String bountyForgivenessPeriod;
}