package api.app.astrodao.com.core.dto.api.proposals;

import api.app.astrodao.com.openapi.models.Proposal;
import api.app.astrodao.com.openapi.models.ProposalAction;
import api.app.astrodao.com.openapi.models.ProposalPermissions;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;

@Data
public class ProposalDto {
    private Boolean isArchived;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private String transactionHash;
    private String updateTransactionHash;
    private BigDecimal createTimestamp;
    private BigDecimal updateTimestamp;
    private String id;
    private Integer proposalId;
    private String daoId;
    private String proposer;
    private String description;
    private Proposal.StatusEnum status;
    private Proposal.VoteStatusEnum voteStatus;
    private Kind kind;
    private String type;
    private String policyLabel;
    private String submissionTime;
    private HashMap<String, String> votes;
    private BigDecimal votePeriodEnd;
    private Object bountyDoneId;
    private Object bountyClaimId;
    private Dao dao;
    private List<ProposalAction> actions;
    private Integer commentsCount;
    private ProposalPermissions permissions;
    private VoteCounts voteCounts;
}
