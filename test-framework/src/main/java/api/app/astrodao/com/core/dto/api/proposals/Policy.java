package api.app.astrodao.com.core.dto.api.proposals;

import lombok.Data;

import java.util.List;

@Data
public class Policy {
    private String createdAt;
    private String daoId;
    private String proposalBond;
    private String bountyBond;
    private String proposalPeriod;
    private String bountyForgivenessPeriod;
    private DefaultVotePolicy defaultVotePolicy;
    private List<Role> roles;
}
