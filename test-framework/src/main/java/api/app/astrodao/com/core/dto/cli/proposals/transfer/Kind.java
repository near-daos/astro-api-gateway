package api.app.astrodao.com.core.dto.cli.proposals.transfer;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor(staticName = "of")
public class Kind {
    @JsonProperty("Transfer")
    private Transfer transfer;
}
