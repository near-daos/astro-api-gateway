package api.app.astrodao.com.core.dto.cli.dao;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Data;
import lombok.experimental.Accessors;

import java.util.List;

@JsonPropertyOrder({
        "roles",
        "default_vote_policy",
        "proposal_bond",
        "proposal_period",
        "bounty_bond",
        "bounty_forgiveness_period"
})
@Accessors(chain = true)
@Data(staticConstructor = "of")
public class Policy {
    @JsonProperty("roles")
    public List<Role> roles;
    @JsonProperty("default_vote_policy")
    public DefaultVotePolicy defaultVotePolicy;
    @JsonProperty("proposal_bond")
    public String proposalBond;
    @JsonProperty("proposal_period")
    public String proposalPeriod;
    @JsonProperty("bounty_bond")
    public String bountyBond;
    @JsonProperty("bounty_forgiveness_period")
    public String bountyForgivenessPeriod;
}
