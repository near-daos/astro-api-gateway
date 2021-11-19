package api.app.astrodao.com.core.dto.cli.dao;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Data;
import lombok.experimental.Accessors;

@JsonPropertyOrder({
        "purpose",
        "bond",
        "vote_period",
        "grace_period",
        "policy",
        "config"
})
@Accessors(chain = true)
@Data(staticConstructor = "of")
public class DAOArgs {
    private String purpose;
    private String bond;
    @JsonProperty("vote_period")
    private String votePeriod;
    @JsonProperty("grace_period")
    private String gracePeriod;
    private Policy policy;
    private Config config;
}
