package api.app.astrodao.com.core.dto.cli.proposals.bounty;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.experimental.Accessors;

@Accessors(chain = true)
@Data(staticConstructor = "of")
public class Proposal {
    @JsonProperty("description")
    private String description;
    @JsonProperty("kind")
    private Kind kind;
}
