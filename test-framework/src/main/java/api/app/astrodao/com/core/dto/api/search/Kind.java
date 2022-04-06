package api.app.astrodao.com.core.dto.api.search;

import lombok.Data;

import java.util.List;

@Data
public class Kind {
	private Bounty bounty;
	private String type;
	private Policy policy;
	private Config config;
	private Object msg;
	private String amount;
	private String receiverId;
	private String tokenId;
	private List<Actions> actions;
	private String role;
	private String memberId;
	private List<String> group;
}