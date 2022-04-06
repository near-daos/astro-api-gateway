package api.app.astrodao.com.core.dto.api.dao;

import lombok.Data;

import java.util.List;

@Data
public class RolesItem {
	private String createdAt;
	private Object balance;
	private String kind;
	private List<String> accountIds;
	private List<String> permissions;
	private String name;
	private VotePolicy votePolicy;
	private String id;
}