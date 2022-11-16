package api.app.astrodao.com.core.dto.newsearch.response;

import lombok.Data;

@Data
public class ActionsItem {
	private String accountId;
	private String action;
	private String id;
	private String proposalId;
	private String transactionHash;
	private String timestamp;
}