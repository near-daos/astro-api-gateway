package api.app.astrodao.com.steps;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.controllers.TokenApi;
import io.qameta.allure.Step;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@Steps
@RequiredArgsConstructor
public class TokenApiSteps extends BaseSteps {
    private final TokenApi tokenApi;

    @Step("Getting tokens with '{queryParams}' query params")
    public ResponseEntity<String> getTokens(Map<String, Object> queryParams) {
        return tokenApi.getTokens(queryParams);
    }

    @Step("Getting tokens for '{queryParams}' DAO")
    public ResponseEntity<String> getTokensForDao(String dao) {
        return tokenApi.getTokensForDao(dao);
    }

    @Step("Getting NFTs with '{queryParams}' query params")
    public ResponseEntity<String> getNFTs(Map<String, Object> queryParams) {
        return tokenApi.getNFTs(queryParams);
    }

    @Step("Getting events for NFT")
    public ResponseEntity<String> getEventsForNFT(String nftID) {
        return tokenApi.getEventsForNFT(nftID);
    }
}
