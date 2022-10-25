package api.app.astrodao.com.core.dto.newsearch.response;

import lombok.Data;

import java.util.List;

@Data
public class RolesItem {
	private Object balance;
	private String kind;
	private List<String> accountIds;
	private List<String> permissions;
	private String name;
	private VotePolicy votePolicy;
	private String id;
}