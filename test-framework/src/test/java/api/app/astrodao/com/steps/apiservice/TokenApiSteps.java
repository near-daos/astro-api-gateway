package api.app.astrodao.com.steps.apiservice;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.controllers.apiservice.TokenApi;
import api.app.astrodao.com.steps.BaseSteps;
import io.qameta.allure.Step;
import io.restassured.response.Response;
import lombok.RequiredArgsConstructor;

import java.util.Map;

@Steps
@RequiredArgsConstructor
public class TokenApiSteps extends BaseSteps {
    private final TokenApi tokenApi;

    @Step("Getting tokens with '{queryParams}' query params")
    public Response getTokens(Map<String, Object> queryParams) {
        return tokenApi.getTokens(queryParams);
    }

    @Step("Getting tokens for '{queryParams}' DAO")
    public Response getTokensForDao(String dao) {
        return tokenApi.getTokensForDao(dao);
    }

    @Step("Getting NFTs with '{queryParams}' query params")
    public Response getNFTs(Map<String, Object> queryParams) {
        return tokenApi.getNFTs(queryParams);
    }

    @Step("Getting events for NFT")
    public Response getEventsForNFT(String nftID) {
        return tokenApi.getEventsForNFT(nftID);
    }
}
