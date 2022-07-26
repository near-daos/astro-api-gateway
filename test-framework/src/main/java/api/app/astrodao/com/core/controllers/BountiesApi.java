package api.app.astrodao.com.core.controllers;

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
public class BountiesApi {
    private final RequestSpecification requestSpecForApiService;

    public Response getBountyByID(String bountyId) {
        return given().spec(requestSpecForApiService)
                .accept(ContentType.JSON)
                .get(BOUNTIES_ID, bountyId);
    }

    public Response getBounties(Map<String, Object> queryParams) {
        return given().spec(requestSpecForApiService)
                .accept(ContentType.JSON)
                .queryParams(queryParams)
                .get(BOUNTIES);
    }

    public Response getBountyContexts() {
        return given().spec(requestSpecForApiService)
                .accept(ContentType.JSON)
                .get(BOUNTY_CONTEXTS);
    }

    public Response getBountyContextsWithParams(Map<String, Object> queryParams) {
        return given().spec(requestSpecForApiService)
                .accept(ContentType.JSON)
                .queryParams(queryParams)
                .get(BOUNTY_CONTEXTS);
    }
}
