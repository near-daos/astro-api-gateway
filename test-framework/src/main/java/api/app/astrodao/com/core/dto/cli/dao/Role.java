package api.app.astrodao.com.core.dto.cli.dao;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Data;
import lombok.experimental.Accessors;

import java.util.List;

@JsonPropertyOrder({
        "name",
        "kind",
        "permissions",
        "vote_policy"
})
@Accessors(chain = true)
@Data(staticConstructor = "of")
public class Role {
    @JsonProperty("name")
    public String name;
    @JsonProperty("kind")
    public RoleKind kind;
    @JsonProperty("permissions")
    public List<String> permissions;
    @JsonProperty("vote_policy")
    public VotePolicy votePolicy;
}
