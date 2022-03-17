package api.app.astrodao.com.core.dto.api.search;

import lombok.Data;

import java.util.List;

@Data
public class RolesItem {
	private String daoId;
	private Object kind;
	private List<String> permissions;
	private String name;
	private VotePolicy votePolicy;
	private List<String> accountIds;
}