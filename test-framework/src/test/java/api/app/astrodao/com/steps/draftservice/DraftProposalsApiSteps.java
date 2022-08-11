package api.app.astrodao.com.steps.draftservice;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.controllers.draftservice.DraftProposalsApi;
import api.app.astrodao.com.steps.BaseSteps;
import io.qameta.allure.Step;
import io.restassured.response.Response;
import lombok.RequiredArgsConstructor;

import java.util.Map;

@Steps
@RequiredArgsConstructor
public class DraftProposalsApiSteps extends BaseSteps {
	private final DraftProposalsApi draftProposalsApi;


	@Step("Get draft-proposals with query params '{queryParams}'")
	public Response getDraftProposals(Map<String, Object> queryParams) {
		return draftProposalsApi.getDraftProposals(queryParams);
	}

	@Step("Get draft-proposal by ID '{draftId}' and accountId '{accountId}'")
	public Response getDraftProposalById(String draftId, String accountId) {
		return draftProposalsApi.getDraftProposalById(draftId, accountId);
	}
}