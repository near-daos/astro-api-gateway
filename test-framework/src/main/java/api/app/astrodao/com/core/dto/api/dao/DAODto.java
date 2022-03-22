package api.app.astrodao.com.core.dto.api.dao;

import lombok.Data;

import java.util.List;

@Data
public class DAODto {
	private String stakingContract;
	private double totalDaoFunds;
	private Metadata metadata;
	private int numberOfMembers;
	private String link;
	private String description;
	private String transactionHash;
	private int councilSeats;
	private String createTimestamp;
	private int numberOfAssociates;
	private String createdAt;
	private List<String> accountIds;
	private int activeProposalCount;
	private int numberOfGroups;
	private String id;
	private Policy policy;
	private String amount;
	private String updateTransactionHash;
	private String totalSupply;
	private String updateTimestamp;
	private String createdBy;
	private List<Object> council;
	private int lastProposalId;
	private int lastBountyId;
	private Config config;
	private String status;
	private int totalProposalCount;
}