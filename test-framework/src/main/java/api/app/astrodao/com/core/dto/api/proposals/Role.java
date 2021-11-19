package api.app.astrodao.com.core.dto.api.proposals;

import lombok.Data;

import java.util.List;

@Data
public class Role {
    private String createdAt;
    private String id;
    private String name;
    private String kind;
    private Object balance;
    private Object accountIds;
    private List<String> permissions;
    private VotePolicy votePolicy;
}
