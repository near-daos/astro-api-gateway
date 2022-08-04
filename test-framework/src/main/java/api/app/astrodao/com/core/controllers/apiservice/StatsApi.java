package api.app.astrodao.com.core.controllers.apiservice;

import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import static api.app.astrodao.com.core.Constants.ApiServiceEndpoints.*;
import static io.restassured.RestAssured.given;

@Component
@RequiredArgsConstructor
public class StatsApi {
    private final RequestSpecification requestSpecForApiService;

    public Response getStateForDao(String dao) {
        return given().spec(requestSpecForApiService)
                .accept(ContentType.JSON)
                .get(DAO_STATS_STATE, dao);
    }

    public Response getFundsForDao(String dao) {
        return given().spec(requestSpecForApiService)
                .accept(ContentType.JSON)
                .get(DAO_STATS_FUNDS, dao);
    }

    public Response getBountiesForDao(String dao) {
        return given().spec(requestSpecForApiService)
                .accept(ContentType.JSON)
                .get(DAO_STATS_BOUNTIES, dao);
    }

    public Response getNFTsForDao(String dao) {
        return given().spec(requestSpecForApiService)
                .accept(ContentType.JSON)
                .get(DAO_STATS_NFTS, dao);
    }

    public Response getProposalsForDao(String dao) {
        return given().spec(requestSpecForApiService)
                .accept(ContentType.JSON)
                .get(DAO_STATS_PROPOSALS, dao);
    }
}
