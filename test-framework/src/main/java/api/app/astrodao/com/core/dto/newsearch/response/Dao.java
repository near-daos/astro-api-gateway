package api.app.astrodao.com.core.dto.newsearch.response;

import lombok.Data;

import java.util.List;

@Data
public class Dao {
	private Double totalDaoFunds;
	private String stakingContract;
	private Metadata metadata;
	private Integer numberOfMembers;
	private Boolean isArchived;
	private DaoVersion daoVersion;
	private String link;
	private String description;
	private List<Object> delegations;
	private String indexedBy;
	private Integer councilSeats;
	private String transactionHash;
	private Integer numberOfAssociates;
	private String createTimestamp;
	private List<String> accountIds;
	private Integer activeProposalCount;
	private Integer numberOfGroups;
	private String id;
	private Policy policy;
	private String amount;
	private String partitionId;
	private String entityType;
	private String updateTransactionHash;
	private String totalSupply;
	private String index;
	private String entityId;
	private String updateTimestamp;
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