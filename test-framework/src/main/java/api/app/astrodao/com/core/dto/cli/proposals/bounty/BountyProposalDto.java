package api.app.astrodao.com.core.dto.cli.proposals.bounty;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.experimental.Accessors;

@Accessors(chain = true)
@Data
@AllArgsConstructor(staticName = "of")
public class BountyProposalDto {
    @JsonProperty("proposal")
    private Proposal proposal;
}
