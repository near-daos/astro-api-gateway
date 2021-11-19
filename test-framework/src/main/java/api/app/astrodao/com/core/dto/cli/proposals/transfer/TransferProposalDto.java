package api.app.astrodao.com.core.dto.cli.proposals.transfer;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor(staticName = "of")
public class TransferProposalDto {
    private TransferProposal proposal;

    public static TransferProposalDto of(String description, Transfer transfer) {
        return TransferProposalDto.of(TransferProposal.of(description, Kind.of(transfer)));
    }
}
