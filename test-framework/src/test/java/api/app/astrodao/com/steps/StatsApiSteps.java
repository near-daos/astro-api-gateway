package api.app.astrodao.com.steps;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.controllers.StatsApi;
import io.qameta.allure.Step;
import io.restassured.response.Response;
import lombok.RequiredArgsConstructor;

@Steps
@RequiredArgsConstructor
public class StatsApiSteps extends BaseSteps {
    private final StatsApi statsApi;

    @Step("Getting state for a DAO")
    public Response getStateForDao(String dao) {
        return statsApi.getStateForDao(dao);
    }

    @Step("Getting funds for a DAO")
    public Response getFundsForDao(String dao) {
        return statsApi.getFundsForDao(dao);
    }

    @Step("Getting bounties for a DAO")
    public Response getBountiesForDao(String dao) {
        return statsApi.getBountiesForDao(dao);
    }

    @Step("Getting NFTs for a DAO")
    public Response getNFTsForDao(String dao) {
        return statsApi.getNFTsForDao(dao);
    }

    @Step("Getting proposals for a DAO")
    public Response getProposalsForDao(String dao) {
        return statsApi.getProposalsForDao(dao);
    }
}
