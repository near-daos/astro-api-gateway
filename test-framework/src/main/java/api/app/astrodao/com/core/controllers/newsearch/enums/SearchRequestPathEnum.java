package api.app.astrodao.com.core.controllers.newsearch.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum SearchRequestPathEnum {
	PROPOSAL("proposal"),
	DAOs("dao"),
	DRAFT_PROPOSAL("draftproposal");

	@Getter private final String fieldValue;
}
