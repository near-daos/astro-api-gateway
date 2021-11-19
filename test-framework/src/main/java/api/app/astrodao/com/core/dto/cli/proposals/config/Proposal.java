package api.app.astrodao.com.core.dto.cli.proposals.config;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor(staticName = "of")
public class Proposal {
    private String description;
    private Kind kind;
}
