package api.app.astrodao.com.steps.draftservice;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.controllers.draftservice.DraftApi;
import api.app.astrodao.com.openapi.models.DraftCommentPageResponse;
import api.app.astrodao.com.steps.BaseSteps;
import io.qameta.allure.Step;
import io.restassured.response.Response;
import lombok.RequiredArgsConstructor;

import java.util.Map;

import static java.net.HttpURLConnection.HTTP_OK;

@Steps
@RequiredArgsConstructor
public class DraftCommentsApiSteps extends BaseSteps {
	private final DraftApi draftApi;


	public void deleteAllComments(String authToken) {
		DraftCommentPageResponse draftCommentPageResponse = getDraftComments(Map.of("contextId", "6332ae623b5f700008b15b62")).then()
				.statusCode(HTTP_OK)
				.extract().as(DraftCommentPageResponse.class);

		if (draftCommentPageResponse.getTotal().intValue() > 0)
			draftCommentPageResponse.getData().forEach(draftCommentResponse -> deleteDraftComment(draftCommentResponse.getId(), authToken));
	}

	@Step("Get draft comments with query params '{queryParams}'")
	public Response getDraftComments(Map<String, Object> queryParams) {
		return draftApi.getDraftComments(queryParams);
	}

	@Step("Create draft comment")
	public Response createDraftComment(String contextId, String comment, String authToken) {
		return draftApi.createDraftComment(contextId, comment, authToken);
	}

	@Step("Update draft comment")
	public Response updateDraftComment(String commentId, String comment, String authToken) {
		return draftApi.patchDraftComment(commentId, comment, authToken);
	}

	@Step("Like draft comment")
	public Response likeDraftComment(String commentId, String authToken) {
		return draftApi.likeDraftComment(commentId, authToken);
	}

	@Step("Remove like from draft comment")
	public Response removeLikeFromDraftComment(String commentId, String authToken) {
		return draftApi.removeLikeFromDraftComment(commentId, authToken);
	}

	@Step("Delete draft comment")
	public Response deleteDraftComment(String commentId, String authToken) {
		return draftApi.deleteDraftComment(commentId, authToken);
	}
}