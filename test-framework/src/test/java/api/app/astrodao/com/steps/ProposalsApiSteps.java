package api.app.astrodao.com.steps;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.controllers.ProposalsApi;
import io.qameta.allure.Step;
import io.restassured.response.Response;
import lombok.RequiredArgsConstructor;

import java.util.Map;

@Steps
@RequiredArgsConstructor
public class ProposalsApiSteps extends BaseSteps {
    private final ProposalsApi proposalsApi;

    @Step("Getting proposal by proposal ID")
    public Response getProposalByID(String proposalId) {
        return proposalsApi.getProposalByID(proposalId);
    }

    @Step("Getting proposal by proposal ID with accountId")
    public Response getProposalByID(String proposalId, String accountId) {
        return proposalsApi.getProposalByID(proposalId, accountId);
    }

    @Step("Getting proposals with '{queryParams}' query params")
    public Response getProposals(Map<String, Object> queryParams) {
        return proposalsApi.getProposals(queryParams);
    }

    @Step("Getting account proposals with '{accountId}' query param")
	public Response getAccountProposalsByAccountId(String accountId) {
        return proposalsApi.getAccountProposalsByAccountId(accountId);
	}

    @Step("Getting account proposals by accountId '{accountId}' with query params '{queryParams}'")
    public Response getAccountProposals(Map<String, Object> queryParams, String accountId) {
        return proposalsApi.getAccountProposals(queryParams, accountId);
    }
}
