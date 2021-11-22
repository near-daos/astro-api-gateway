package api.app.astrodao.com.core.dto.cli.dao;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.experimental.Accessors;

import java.util.List;

@Accessors(chain = true)
@Data(staticConstructor = "of")
public class DefaultVotePolicy {
    @JsonProperty("weight_kind")
    public String weightKind;
    public String quorum;
    public List<Integer> threshold;
}
