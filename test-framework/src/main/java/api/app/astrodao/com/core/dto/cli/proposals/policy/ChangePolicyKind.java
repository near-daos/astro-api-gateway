package api.app.astrodao.com.core.dto.cli.proposals.policy;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor(staticName = "of")
public class ChangePolicyKind {
    @JsonProperty("ChangePolicy")
    public ChangePolicy changePolicy;
}
