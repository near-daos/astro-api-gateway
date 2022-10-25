package api.app.astrodao.com.core.dto.newsearch.response;

import lombok.Data;

import java.util.List;

@Data
public class Source {
	private Object bountyClaimId;
	private VoteCounts voteCounts;
	private Boolean isArchived;
	private String description;
	private String type;
	private String indexedBy;
	private Integer proposalId;
	private String submissionTime;
	private String transactionHash;
	private String createTimestamp;
	private Dao dao;
	private String id;
	private Object bountyDoneId;
	private String policyLabel;
	private String partitionId;
	private String entityType;
	private Kind kind;
	private String proposer;
	private String updateTransactionHash;
	private String index;
	private String entityId;
	private String voteStatus;
	private String votePeriodEnd;
	private String updateTimestamp;
	private Integer commentsCount;
	private Object failure;
	private String votes;
	private String accounts;
	private List<ActionsItem> actions;
	private String status;
}