package api.app.astrodao.com.core.dto.cli.proposals.transfer;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor(staticName = "of")
public class TransferProposal {
    public String description;
    public Kind kind;
}
