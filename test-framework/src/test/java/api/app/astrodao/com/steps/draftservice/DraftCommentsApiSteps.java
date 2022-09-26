package api.app.astrodao.com.steps.draftservice;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.controllers.draftservice.DraftApi;
import api.app.astrodao.com.steps.BaseSteps;
import io.qameta.allure.Step;
import io.restassured.response.Response;
import lombok.RequiredArgsConstructor;

import java.util.Map;

@Steps
@RequiredArgsConstructor
public class DraftCommentsApiSteps extends BaseSteps {
	private final DraftApi draftApi;


	@Step("Get draft comments with query params '{queryParams}'")
	public Response getDraftComments(Map<String, Object> queryParams) {
		return draftApi.getDraftComments(queryParams);
	}

	@Step("Create draft comment")
	public Response createDraftComment(String contextId, String comment, String authToken) {
		return draftApi.createDraftComment(contextId, comment, authToken);
	}
}