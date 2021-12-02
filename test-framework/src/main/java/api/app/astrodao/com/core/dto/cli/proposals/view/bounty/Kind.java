package api.app.astrodao.com.core.dto.cli.proposals.view.bounty;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class Kind {
    @JsonProperty("AddBounty")
    private AddBounty addBounty;
}
