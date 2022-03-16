package api.app.astrodao.com.core.controllers;

import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

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
}
