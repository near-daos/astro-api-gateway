package api.app.astrodao.com.core.dto.api.search;

import java.util.List;
import lombok.Data;

public @Data class DataItem{
	private String accountId;
	private List<RolesItem> roles;
	private int voteCount;
	private String daoId;
	private String proposer;
	private Kind kind;
	private String description;
	private String voteStatus;
	private String type;
	private String votePeriodEnd;
	private String transactionHash;
	private int proposalId;
	private String createdAt;
	private Dao dao;
	private int commentsCount;
	private Permissions permissions;
	private Votes votes;
	private String id;
	private String updatedAt;
	private String status;
	private double totalDaoFunds;
	private int numberOfMembers;
	private List<String> accountIds;
	private int activeProposalCount;
	private int numberOfGroups;
	private Config config;
	private int totalProposalCount;
	private Policy policy;
}