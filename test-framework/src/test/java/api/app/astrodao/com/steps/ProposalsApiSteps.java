package api.app.astrodao.com.steps;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.controllers.ProposalsApi;
import io.qameta.allure.Step;
import io.restassured.response.Response;
import lombok.RequiredArgsConstructor;

@Steps
@RequiredArgsConstructor
public class ProposalsApiSteps extends BaseSteps {
    private final ProposalsApi proposalsApi;

    @Step("Getting proposal by proposal ID")
    public Response getProposalByID(String proposalId) {
        return proposalsApi.getProposalByID(proposalId);
    }
}
