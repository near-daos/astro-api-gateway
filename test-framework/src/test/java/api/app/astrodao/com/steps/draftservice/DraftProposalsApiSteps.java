package api.app.astrodao.com.steps.draftservice;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.controllers.draftservice.DraftApi;
import api.app.astrodao.com.openapi.models.CreateDraftProposal;
import api.app.astrodao.com.steps.BaseSteps;
import io.qameta.allure.Step;
import io.restassured.response.Response;
import lombok.RequiredArgsConstructor;

import java.util.Map;

@Steps
@RequiredArgsConstructor
public class DraftProposalsApiSteps extends BaseSteps {
	private final DraftApi draftApi;


	@Step("Get draft proposals with query params '{queryParams}'")
	public Response getDraftProposals(Map<String, Object> queryParams) {
		return draftApi.getDraftProposals(queryParams);
	}

	@Step("Get draft proposal by ID '{draftId}' and accountId '{accountId}'")
	public Response getDraftProposalById(String draftId, String accountId) {
		return draftApi.getDraftProposalById(draftId, accountId);
	}

	@Step("Create draft proposal")
	public Response createDraftProposal(CreateDraftProposal draftProposal, String authToken) {
		return draftApi.postDraftProposals(draftProposal, authToken);
	}

	@Step("Update draft proposal")
	public Response updateDraftProposal(CreateDraftProposal draftProposal, String daoId, String draftId, String authToken) {
		return draftApi.patchDraftProposal(draftProposal, daoId, draftId, authToken);
	}

	@Step("Delete draft proposal")
	public Response deleteDraftProposal(String daoId, String draftId, String authToken) {
		return draftApi.deleteDraftProposal(daoId, draftId, authToken);
	}

	@Step("Mark draft proposal as 'Read'")
	public Response viewDraftProposal(String daoId, String draftId, String authToken) {
		return draftApi.postViewDraftProposal(daoId, draftId, authToken);
	}

	@Step("Save draft proposal")
	public Response saveDraftProposal(String daoId, String draftId, String authToken) {
		return draftApi.postSaveDraftProposal(daoId, draftId, authToken);
	}

	@Step("Unsave draft proposal")
	public Response unsaveDraftProposal(String daoId, String draftId, String authToken) {
		return draftApi.unsaveDraftProposal(daoId, draftId, authToken);
	}

	@Step("Close draft proposal")
	public Response closeDraftProposal(String daoId, String draftId, String authToken) {
		return draftApi.closeDraftProposal(daoId, draftId, authToken);
	}

	@Step("Close draft proposal with empty body")
	public Response closeDraftProposalWithEmptyBody(String daoId, String draftId, String authToken) {
		return draftApi.closeDraftProposalWithEmptyBody(daoId, draftId, authToken);
	}
}