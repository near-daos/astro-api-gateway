package api.app.astrodao.com.core.dto.cli.proposals.bounty;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;

@AllArgsConstructor(staticName = "of")
public class Kind {
    @JsonProperty("AddBounty")
    private AddBounty addBounty;
}
