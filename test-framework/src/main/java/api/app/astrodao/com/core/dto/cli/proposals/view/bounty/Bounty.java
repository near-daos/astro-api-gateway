package api.app.astrodao.com.core.dto.cli.proposals.view.bounty;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class Bounty {
    private String description;
    private String token;
    private String amount;
    private Integer times;
    @JsonProperty("max_deadline")
    private String maxDeadline;
}
