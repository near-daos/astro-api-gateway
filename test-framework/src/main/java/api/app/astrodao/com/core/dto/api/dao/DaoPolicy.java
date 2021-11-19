package api.app.astrodao.com.core.dto.api.dao;

import lombok.Data;

import java.util.List;

@Data
public class DaoPolicy {
    private Boolean isArchived;
    private String createdAt;
    private String updatedAt;
    private String daoId;
    private String proposalBond;
    private String bountyBond;
    private String proposalPeriod;
    private String bountyForgivenessPeriod;
    private DefaultVotePolicy defaultVotePolicy;
    private List<Role> roles;
}