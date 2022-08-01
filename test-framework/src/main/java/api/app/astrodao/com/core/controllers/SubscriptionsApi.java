package api.app.astrodao.com.core.controllers;

import api.app.astrodao.com.core.utils.JsonUtils;
import api.app.astrodao.com.openapi.models.SubscriptionDto;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import static api.app.astrodao.com.core.Constants.Endpoints.*;
import static io.restassured.RestAssured.given;
import static io.restassured.http.ContentType.ANY;
import static io.restassured.http.ContentType.JSON;

@Component
@RequiredArgsConstructor
public class SubscriptionsApi {
    private final RequestSpecification requestSpecForApiService;

    public Response subscribeDao(String token, String daoId) {
        SubscriptionDto subscriptionDto = new SubscriptionDto();
        subscriptionDto.setDaoId(daoId);

        return given().spec(requestSpecForApiService)
                .accept(ANY)
                .header("Authorization", "Bearer " + token)
                .contentType(JSON)
                .body(JsonUtils.writeValueAsString(subscriptionDto))
                .post(SUBSCRIPTIONS);
    }

    public Response accountSubscriptions(String accountId) {
        return given().spec(requestSpecForApiService)
                .accept(JSON)
                .contentType(JSON)
                .get(ACCOUNT_SUBSCRIPTIONS, accountId);
    }

    public Response deleteSubscription(String token, String daoId) {
        return given().spec(requestSpecForApiService)
                .accept(ANY)
                .header("Authorization", "Bearer " + token)
                .contentType(JSON)
                .delete(SUBSCRIPTIONS_ID, daoId);
    }
}
