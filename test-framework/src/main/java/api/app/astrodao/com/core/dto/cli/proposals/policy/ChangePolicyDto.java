package api.app.astrodao.com.core.dto.cli.proposals.policy;

import api.app.astrodao.com.core.dto.cli.dao.Policy;
import lombok.Data;
import lombok.experimental.Accessors;

@Accessors(chain = true)
@Data(staticConstructor = "of")
public class ChangePolicyDto {
    private Proposal proposal;

    public static ChangePolicyDto of(String proposalDescription, Policy policy) {
        return ChangePolicyDto.of().setProposal(
                Proposal.of(proposalDescription, ChangePolicyKind.of(ChangePolicy.of(policy)))
        );
    }
}
