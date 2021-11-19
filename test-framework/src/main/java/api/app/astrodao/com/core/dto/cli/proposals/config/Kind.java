package api.app.astrodao.com.core.dto.cli.proposals.config;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor(staticName = "of")
public class Kind {
    @JsonProperty("ChangeConfig")
    private ChangeConfig changeConfig;
}
