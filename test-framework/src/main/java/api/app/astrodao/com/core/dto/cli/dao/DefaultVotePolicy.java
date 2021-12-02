package api.app.astrodao.com.core.dto.cli.dao;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import java.util.List;

@Data
@Accessors(chain = true)
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class DefaultVotePolicy {
    @JsonProperty("weight_kind")
    public String weightKind;
    public String quorum;
    public List<Integer> threshold;

    public static DefaultVotePolicy of() {
        return new DefaultVotePolicy();
    }
}
