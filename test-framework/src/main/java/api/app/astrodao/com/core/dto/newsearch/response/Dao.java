package api.app.astrodao.com.core.dto.newsearch.response;

import lombok.Data;

import java.util.List;

@Data
public class Dao{
	private String stakingContract;
	private Double totalDaoFunds;
	private String metadata;
	private Integer numberOfMembers;
	private String link;
	private String description;
	private Integer councilSeats;
	private String transactionHash;
	private Integer numberOfAssociates;
	private String createTimestamp;
	private String daoVersionHash;
	private List<String> accountIds;
	private Integer activeProposalCount;
	private Integer numberOfGroups;
	private String id;
	private String policy;
	private String amount;
	private String totalSupply;
	private String createdBy;
	private List<String> council;
	private String name;
	private Integer lastProposalId;
	private Integer lastBountyId;
	private String accounts;
	private Config config;
	private String status;
	private Integer totalProposalCount;
}