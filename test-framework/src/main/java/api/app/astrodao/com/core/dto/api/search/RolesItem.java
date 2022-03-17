package api.app.astrodao.com.core.dto.api.search;

import java.util.List;
import lombok.Data;

public @Data class RolesItem{
	private String daoId;
	private Object kind;
	private List<String> permissions;
	private String name;
	private VotePolicy votePolicy;
	private List<String> accountIds;
}