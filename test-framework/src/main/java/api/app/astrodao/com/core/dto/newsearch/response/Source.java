package api.app.astrodao.com.core.dto.newsearch.response;

import lombok.Data;

import java.util.List;

@Data
public class Source{
	private String policyLabel;
	private String daoId;
	private Object bountyClaimId;
	private String proposer;
	private String description;
	private String voteStatus;
	private String type;
	private String votePeriodEnd;
	private Integer proposalId;
	private String submissionTime;
	private String transactionHash;
	private String createTimestamp;
	private Dao dao;
	private String receiverId;
	private Object failure;
	private Integer commentsCount;
	private String name;
	private String votes;
	private String accounts;
	private String id;
	private List<ActionsItem> actions;
	private Object bountyDoneId;
	private String status;
	private String role;
	private String memberId;
	private String policy;
	private Object msg;
	private String amount;
	private String tokenId;
}