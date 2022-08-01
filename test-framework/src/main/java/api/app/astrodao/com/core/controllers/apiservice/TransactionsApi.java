package api.app.astrodao.com.core.controllers.apiservice;

import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import static api.app.astrodao.com.core.Constants.Endpoints.TRANSACTIONS_CALLBACK;
import static io.restassured.RestAssured.given;

@Component
@RequiredArgsConstructor
public class TransactionsApi {
    private final RequestSpecification requestSpecForApiService;

    public Response triggerCallback(String accountId, String transactionHashes) {
        return given().spec(requestSpecForApiService)
                .accept(ContentType.JSON)
                .queryParam("transactionHashes", transactionHashes)
                .get(TRANSACTIONS_CALLBACK, accountId);
    }
}
