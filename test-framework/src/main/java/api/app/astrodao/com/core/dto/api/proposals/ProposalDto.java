package api.app.astrodao.com.core.dto.api.proposals;

import lombok.Data;

@Data
public class ProposalDto {
    private String createdAt;
    private String transactionHash;
    private String updateTransactionHash;
    private String createTimestamp;
    private String updateTimestamp;
    private String id;
    private Integer proposalId;
    private String daoId;
    private String proposer;
    private String description;
    private String status;
    private Kind kind;
    private String type;
    private String submissionTime;
    private VoteCounts voteCounts;
    private Votes votes;
    private String votePeriodEnd;
    private Dao dao;
}
