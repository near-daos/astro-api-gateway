package api.app.astrodao.com.steps.draftservice;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.controllers.draftservice.DraftProposalsApi;
import api.app.astrodao.com.openapi.models.CreateDraftProposal;
import api.app.astrodao.com.steps.BaseSteps;
import io.qameta.allure.Step;
import io.restassured.response.Response;
import lombok.RequiredArgsConstructor;

import java.util.Map;

@Steps
@RequiredArgsConstructor
public class DraftProposalsApiSteps extends BaseSteps {
	private final DraftProposalsApi draftProposalsApi;


	@Step("Get draft proposals with query params '{queryParams}'")
	public Response getDraftProposals(Map<String, Object> queryParams) {
		return draftProposalsApi.getDraftProposals(queryParams);
	}

	@Step("Get draft proposal by ID '{draftId}' and accountId '{accountId}'")
	public Response getDraftProposalById(String draftId, String accountId) {
		return draftProposalsApi.getDraftProposalById(draftId, accountId);
	}

	@Step("Create draft proposal")
	public Response createDraftProposal(CreateDraftProposal draftProposal, String authToken) {
		return draftProposalsApi.postDraftProposals(draftProposal, authToken);
	}

	@Step("Update draft proposal")
	public Response updateDraftProposal(CreateDraftProposal draftProposal, String draftId, String authToken) {
		return draftProposalsApi.patchDraftProposal(draftProposal, draftId, authToken);
	}

	@Step("Delete draft proposal")
	public Response deleteDraftProposal(String draftId, String authToken) {
		return draftProposalsApi.deleteDraftProposal(draftId, authToken);
	}

	@Step("Mark draft proposal as 'Read'")
	public Response viewDraftProposal(String draftId, String authToken) {
		return draftProposalsApi.postViewDraftProposal(draftId, authToken);
	}

	@Step("Save draft proposal")
	public Response saveDraftProposal(String draftId, String authToken) {
		return draftProposalsApi.postSaveDraftProposal(draftId, authToken);
	}

	@Step("Unsave draft proposal")
	public Response unsaveDraftProposal(String draftId, String authToken) {
		return draftProposalsApi.unsaveDraftProposal(draftId, authToken);
	}

	@Step("Close draft proposal")
	public Response closeDraftProposal(String draftId, String authToken) {
		return draftProposalsApi.closeDraftProposal(draftId, authToken);
	}
}