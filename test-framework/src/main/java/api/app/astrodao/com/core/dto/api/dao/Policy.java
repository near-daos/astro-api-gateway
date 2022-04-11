package api.app.astrodao.com.core.dto.api.dao;

import lombok.Data;

import java.util.List;

@Data
public class Policy {
	private String createdAt;
	private String daoId;
	private String proposalPeriod;
	private String bountyBond;
	private DefaultVotePolicy defaultVotePolicy;
	private List<RolesItem> roles;
	private String proposalBond;
	private String bountyForgivenessPeriod;
}