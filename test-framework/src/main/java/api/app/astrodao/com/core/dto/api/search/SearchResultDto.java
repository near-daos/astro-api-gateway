package api.app.astrodao.com.core.dto.api.search;

import lombok.Data;

public @Data class SearchResultDto{
	private Members members;
	private Proposals proposals;
	private Daos daos;
}