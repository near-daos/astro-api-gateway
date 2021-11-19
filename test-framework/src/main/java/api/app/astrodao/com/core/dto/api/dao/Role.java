package api.app.astrodao.com.core.dto.api.dao;

import lombok.Data;

import java.util.List;

@Data
public class Role {
    private Boolean isArchived;
    private String createdAt;
    private String updatedAt;
    private String id;
    private String name;
    private String kind;
    private Object balance;
    private List<String> accountIds;
    private List<String> permissions;
    private VotePolicy votePolicy;
}
