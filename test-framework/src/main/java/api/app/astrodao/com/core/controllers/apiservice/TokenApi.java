package api.app.astrodao.com.core.controllers.apiservice;

import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

import static api.app.astrodao.com.core.Constants.Endpoints.*;
import static io.restassured.RestAssured.given;

@Component
@RequiredArgsConstructor
public class TokenApi {
    private final RequestSpecification requestSpecForApiService;

    public Response getTokens(Map<String, Object> queryParams) {
        return given().spec(requestSpecForApiService)
                .accept(ContentType.JSON)
                .queryParams(queryParams)
                .get(TOKENS);
    }

    public Response getTokensForDao(String dao) {
        return given().spec(requestSpecForApiService)
                .accept(ContentType.JSON)
                .get(ACCOUNT_TOKENS, dao);
    }

    public Response getNFTs(Map<String, Object> queryParams) {
        return given().spec(requestSpecForApiService)
                .accept(ContentType.JSON)
                .queryParams(queryParams)
                .get(TOKENS_NFTS);
    }

    public Response getEventsForNFT(String nftID) {
        return given().spec(requestSpecForApiService)
                .accept(ContentType.JSON)
                .get(TOKENS_NFTS_EVENTS, nftID);
    }
}
