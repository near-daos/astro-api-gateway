package api.app.astrodao.com.core.dto.api.dao;

import lombok.Data;

import java.util.List;

@Data
public class DefaultVotePolicy {
	private String weightKind;
	private String kind;
	private String quorum;
	private List<Integer> ratio;
}