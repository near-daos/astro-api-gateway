package api.app.astrodao.com.core.dto.cli.dao;

import api.app.astrodao.com.core.utils.JsonUtils;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;
import org.apache.commons.lang3.SerializationUtils;

import java.io.Serializable;
import java.util.List;

@JsonPropertyOrder({
        "roles",
        "default_vote_policy",
        "proposal_bond",
        "proposal_period",
        "bounty_bond",
        "bounty_forgiveness_period"
})
@Data
@Accessors(chain = true)
@NoArgsConstructor(access = AccessLevel.PRIVATE)
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

    public static Policy of() {
        return new Policy();
    }

    public static Policy copy(Policy policy) {
        return JsonUtils.readValue(JsonUtils.writeValueAsString(policy), Policy.class);
    }
}
