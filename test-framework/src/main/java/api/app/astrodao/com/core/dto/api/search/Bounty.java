package api.app.astrodao.com.core.dto.api.search;

import lombok.Data;

public @Data class Bounty{
	private String amount;
	private int times;
	private String description;
	private String maxDeadline;
	private String token;
}