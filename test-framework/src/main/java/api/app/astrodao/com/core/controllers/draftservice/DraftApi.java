package api.app.astrodao.com.core.controllers.draftservice;

import api.app.astrodao.com.openapi.models.CloseDraftProposal;
import api.app.astrodao.com.openapi.models.CreateDraftComment;
import api.app.astrodao.com.openapi.models.CreateDraftProposal;
import api.app.astrodao.com.openapi.models.UpdateDraftComment;
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
public class DraftApi {
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

	public Response patchDraftProposal(CreateDraftProposal draftProposal, String daoId, String draftId, String authToken) {
		return given().spec(requestSpecForDraftService)
				.accept(JSON)
				.header("Authorization", "Bearer " + authToken)
				.contentType(JSON)
				.body(draftProposal)
				.patch(DRAFT_PROPOSALS_DAO_ID_ID, daoId, draftId);
	}

	public Response deleteDraftProposal(String daoId, String draftId, String authToken) {
		return given().spec(requestSpecForDraftService)
				.accept(JSON)
				.header("Authorization", "Bearer " + authToken)
				.contentType(JSON)
				.delete(DRAFT_PROPOSALS_DAO_ID_ID, daoId, draftId);
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

	public Response closeDraftProposal(String daoId, String draftId, String authToken) {
		CloseDraftProposal closeDraftProposal = new CloseDraftProposal();
		closeDraftProposal.setProposalId(draftId);

		return given().spec(requestSpecForDraftService)
				.accept(JSON)
				.header("Authorization", "Bearer " + authToken)
				.contentType(JSON)
				.body(closeDraftProposal)
				.post(DRAFT_PROPOSALS_DAO_ID_ID_CLOSE, daoId, draftId);
	}

	public Response closeDraftProposalWithEmptyBody(String daoId, String draftId, String authToken) {
		return given().spec(requestSpecForDraftService)
				.accept(JSON)
				.header("Authorization", "Bearer " + authToken)
				.contentType(JSON)
				.post(DRAFT_PROPOSALS_DAO_ID_ID_CLOSE, daoId, draftId);
	}

	public Response getDraftComments(Map<String, Object> queryParams) {
		return given().spec(requestSpecForDraftService)
				.accept(ContentType.JSON)
				.queryParams(queryParams)
				.get(DRAFT_COMMENTS);
	}

	public Response createDraftComment(String contextId, String comment, String authToken) {
		CreateDraftComment createDraftComment = new CreateDraftComment();
		createDraftComment.setContextId(contextId);
		createDraftComment.setContextType(CreateDraftComment.ContextTypeEnum.DRAFTPROPOSAL);
		createDraftComment.setMessage(comment);

		return given().spec(requestSpecForDraftService)
				.accept(JSON)
				.header("Authorization", "Bearer " + authToken)
				.contentType(JSON)
				.body(createDraftComment)
				.post(DRAFT_COMMENTS);
	}

	public Response patchDraftComment(String commentId, String comment, String authToken) {
		UpdateDraftComment updateDraftComment = new UpdateDraftComment();
		updateDraftComment.setMessage(comment);

		return given().spec(requestSpecForDraftService)
				.accept(JSON)
				.header("Authorization", "Bearer " + authToken)
				.contentType(JSON)
				.body(updateDraftComment)
				.patch(DRAFT_COMMENTS_ID, commentId);
	}

	public Response likeDraftComment(String commentId, String authToken) {
		return given().spec(requestSpecForDraftService)
				.accept(JSON)
				.header("Authorization", "Bearer " + authToken)
				.contentType(JSON)
				.post(DRAFT_COMMENTS_ID_LIKE, commentId);
	}

	public Response removeLikeFromDraftComment(String commentId, String authToken) {
		return given().spec(requestSpecForDraftService)
				.accept(JSON)
				.header("Authorization", "Bearer " + authToken)
				.contentType(JSON)
				.post(DRAFT_COMMENTS_ID_REMOVE_LIKE, commentId);
	}

	public Response deleteDraftComment(String commentId, String authToken) {
		return given().spec(requestSpecForDraftService)
				.accept(JSON)
				.header("Authorization", "Bearer " + authToken)
				.contentType(JSON)
				.delete(DRAFT_COMMENTS_ID, commentId);
	}
}