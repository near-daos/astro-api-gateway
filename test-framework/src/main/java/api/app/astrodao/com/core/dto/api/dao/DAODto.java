package api.app.astrodao.com.core.dto.api.dao;

import api.app.astrodao.com.core.dto.cli.dao.Config;
import lombok.Data;

import java.util.List;

@Data
public class DAODto {
    private Boolean isArchived;
    private String createdAt;
    private String updatedAt;
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
    private DaoPolicy policy;
}
