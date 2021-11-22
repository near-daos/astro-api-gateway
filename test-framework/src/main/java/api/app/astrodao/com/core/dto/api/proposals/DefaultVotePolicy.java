package api.app.astrodao.com.core.dto.api.proposals;

import lombok.Data;

import java.util.List;

@Data
public class DefaultVotePolicy {
    private String weightKind;
    private String quorum;
    private String kind;
    private List<Integer> ratio;
}
