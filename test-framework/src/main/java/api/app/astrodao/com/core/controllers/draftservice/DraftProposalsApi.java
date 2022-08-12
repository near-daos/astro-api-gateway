package api.app.astrodao.com.core.controllers.draftservice;

import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

import static api.app.astrodao.com.core.Constants.DraftServiceEndpoints.DRAFT_PROPOSALS;
import static api.app.astrodao.com.core.Constants.DraftServiceEndpoints.DRAFT_PROPOSALS_ID;
import static io.restassured.RestAssured.given;

@Component
@RequiredArgsConstructor
public class DraftProposalsApi {
	private final RequestSpecification requestSpecForDraftService;


	public Response getDraftProposals(Map<String, Object> queryParams) {
		return given().spec(requestSpecForDraftService)
				.accept(ContentType.JSON)
				.queryParams(queryParams)
				.get(DRAFT_PROPOSALS);
	}

	public Response getDraftProposalById(String draftId, String accountId) {
		return given().spec(requestSpecForDraftService)
				.accept(ContentType.JSON)
				.queryParam("accountId", accountId)
				.get(DRAFT_PROPOSALS_ID, draftId);
	}
}