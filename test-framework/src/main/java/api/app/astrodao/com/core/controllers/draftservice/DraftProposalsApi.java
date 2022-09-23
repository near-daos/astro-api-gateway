package api.app.astrodao.com.core.controllers.draftservice;

import api.app.astrodao.com.openapi.models.CreateDraftProposal;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

import static api.app.astrodao.com.core.Constants.DraftServiceEndpoints.*;
import static io.restassured.RestAssured.given;
import static io.restassured.http.ContentType.JSON;

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

	public Response postDraftProposals(CreateDraftProposal draftProposal, String authToken) {
		return given().spec(requestSpecForDraftService)
				.accept(JSON)
				.header("Authorization", "Bearer " + authToken)
				.contentType(JSON)
				.body(draftProposal)
				.post(DRAFT_PROPOSALS);
	}

	public Response patchDraftProposal(CreateDraftProposal draftProposal, String draftId, String authToken) {
		return given().spec(requestSpecForDraftService)
				.accept(JSON)
				.header("Authorization", "Bearer " + authToken)
				.contentType(JSON)
				.body(draftProposal)
				.patch(DRAFT_PROPOSALS_ID, draftId);
	}

	public Response deleteDraftProposal(String draftId, String authToken) {
		return given().spec(requestSpecForDraftService)
				.accept(JSON)
				.header("Authorization", "Bearer " + authToken)
				.contentType(JSON)
				.delete(DRAFT_PROPOSALS_ID, draftId);
	}

	public Response postViewDraftProposal(String draftId, String authToken) {
		return given().spec(requestSpecForDraftService)
				.accept(JSON)
				.header("Authorization", "Bearer " + authToken)
				.contentType(JSON)
				.post(DRAFT_PROPOSALS_ID_VIEW, draftId);
	}

	public Response postSaveDraftProposal(String draftId, String authToken) {
		return given().spec(requestSpecForDraftService)
				.accept(JSON)
				.header("Authorization", "Bearer " + authToken)
				.contentType(JSON)
				.post(DRAFT_PROPOSALS_ID_SAVE, draftId);
	}

	public Response unsaveDraftProposal(String draftId, String authToken) {
		return given().spec(requestSpecForDraftService)
				.accept(JSON)
				.header("Authorization", "Bearer " + authToken)
				.contentType(JSON)
				.delete(DRAFT_PROPOSALS_ID_SAVE, draftId);
	}

	public Response closeDraftProposal(String draftId, String authToken) {
		return given().spec(requestSpecForDraftService)
				.accept(JSON)
				.header("Authorization", "Bearer " + authToken)
				.contentType(JSON)
				.post(DRAFT_PROPOSALS_ID_CLOSE, draftId);
	}
}