package api.app.astrodao.com.core.dto.cli.proposals.config;

import api.app.astrodao.com.core.dto.cli.dao.Config;
import lombok.Data;
import lombok.experimental.Accessors;

@Accessors(chain = true)
@Data(staticConstructor = "of")
public class ChangeConfigDto {
    private Proposal proposal;

    public static ChangeConfigDto of(String proposalDescription, Config config) {
        return ChangeConfigDto.of().setProposal(
                Proposal.of(proposalDescription, Kind.of(ChangeConfig.of(config)))
        );
    }
}
