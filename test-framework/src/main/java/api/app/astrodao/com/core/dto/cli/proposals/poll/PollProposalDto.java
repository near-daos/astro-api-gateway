package api.app.astrodao.com.core.dto.cli.proposals.poll;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor(staticName = "of")
public class PollProposalDto {
    private PollProposal proposal;
}
