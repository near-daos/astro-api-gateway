package api.app.astrodao.com.core.dto.api.search;

import lombok.Data;

public @Data class Dao{
	private int numberOfMembers;
	private String id;
	private Config config;
	private String transactionHash;
	private Policy policy;
}