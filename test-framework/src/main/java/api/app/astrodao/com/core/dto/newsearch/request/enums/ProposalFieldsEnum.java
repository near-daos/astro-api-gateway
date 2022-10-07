package api.app.astrodao.com.core.dto.newsearch.request.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;


@RequiredArgsConstructor
public enum ProposalFieldsEnum {
	PROPOSER("proposer"),
	DESCRIPTION("description"),
	TYPE("type"),
	VOTES("votes"),
	STATUS("status"),
	DAO_ID("daoId");

	@Getter private final String fieldValue;
}
