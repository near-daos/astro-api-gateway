package api.app.astrodao.com.core.dto.api.dao;

import lombok.Data;

import java.util.List;

@Data
public class DefaultVotePolicy {
    public String weightKind;
    public String quorum;
    public String kind;
    public List<Integer> ratio;
}
