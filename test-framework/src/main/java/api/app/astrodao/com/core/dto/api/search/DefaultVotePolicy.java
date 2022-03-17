package api.app.astrodao.com.core.dto.api.search;

import java.util.List;
import lombok.Data;

@Data
public class DefaultVotePolicy{
	private String weightKind;
	private String kind;
	private String quorum;
	private List<Integer> ratio;
	private List<Integer> threshold;
}