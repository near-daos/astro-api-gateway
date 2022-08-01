package api.app.astrodao.com.steps.apiservice;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.controllers.apiservice.BountiesApi;
import api.app.astrodao.com.steps.BaseSteps;
import io.qameta.allure.Step;
import io.restassured.response.Response;
import lombok.RequiredArgsConstructor;

import java.util.Map;

@Steps
@RequiredArgsConstructor
public class BountiesApiSteps extends BaseSteps {
    private final BountiesApi bountiesApi;

    @Step("Getting bounty by bounty ID")
    public Response getBountyByID(String bountyId) {
        return bountiesApi.getBountyByID(bountyId);
    }

    @Step("Getting bounties with '{queryParams}' query params")
    public Response getBounties(Map<String, Object> queryParams) {
        return bountiesApi.getBounties(queryParams);
    }

    @Step("Getting Bounty-contexts without query params")
    public Response getBountyContexts() {
        return bountiesApi.getBountyContexts();
    }

    @Step("Getting Bounty-contexts with query params '{queryParams}'")
    public Response getBountyContextsWithParams(Map<String, Object> queryParams) {
        return bountiesApi.getBountyContextsWithParams(queryParams);
    }
}
