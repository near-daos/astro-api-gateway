package api.app.astrodao.com.core.dto.api.search;

import lombok.Data;

@Data
public class SearchResultDto {
	private Members members;
	private Proposals proposals;
	private Daos daos;
}