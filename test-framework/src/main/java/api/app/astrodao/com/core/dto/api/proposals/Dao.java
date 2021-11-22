package api.app.astrodao.com.core.dto.api.proposals;

import lombok.Data;

import java.util.List;

@Data
public class Dao {
    private String createdAt;
    private String transactionHash;
    private String updateTransactionHash;
    private String createTimestamp;
    private String updateTimestamp;
    private String id;
    private Config config;
    private String amount;
    private String totalSupply;
    private Integer lastBountyId;
    private Integer lastProposalId;
    private String stakingContract;
    private Integer numberOfAssociates;
    private Integer numberOfMembers;
    private List<Object> council;
    private Integer councilSeats;
    private Object link;
    private Object description;
    private String createdBy;
    private Policy policy;
}
