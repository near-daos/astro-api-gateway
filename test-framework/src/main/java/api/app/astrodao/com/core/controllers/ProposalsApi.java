package api.app.astrodao.com.core.controllers;

import api.app.astrodao.com.core.Constants;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

import static api.app.astrodao.com.core.Constants.Endpoints.PROPOSALS_ID;
import static io.restassured.RestAssured.given;

@Component
@RequiredArgsConstructor
public class ProposalsApi {
    private final RequestSpecification requestSpec;

    public Response getProposalByID(String proposalId) {
        return given().spec(requestSpec)
                .accept(ContentType.JSON)
                .get(PROPOSALS_ID, proposalId);
    }

    public Response getProposalByID(String proposalId, String accountId) {
        return given().spec(requestSpec)
                .accept(ContentType.JSON)
                .queryParam("accountId", accountId)
                .get(PROPOSALS_ID, proposalId);
    }

    public Response getProposals(Map<String, Object> queryParams) {
        return given().spec(requestSpec)
                .queryParams(queryParams)
                .accept(ContentType.JSON)
                .get(Constants.Endpoints.PROPOSALS);
    }
}
