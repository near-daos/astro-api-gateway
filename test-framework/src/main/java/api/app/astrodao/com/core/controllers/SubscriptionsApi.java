package api.app.astrodao.com.core.controllers;

import api.app.astrodao.com.core.utils.JsonUtils;
import api.app.astrodao.com.openapi.models.SubscriptionDeleteDto;
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
    private final RequestSpecification requestSpec;

    public Response subscribeDao(String accountId, String publicKey, String signature, String daoId) {
        SubscriptionDto subscriptionDto = new SubscriptionDto();
        subscriptionDto.setAccountId(accountId);
        subscriptionDto.setPublicKey(publicKey);
        subscriptionDto.setSignature(signature);
        subscriptionDto.setDaoId(daoId);

        return given().spec(requestSpec)
                .accept(ANY)
                .contentType(JSON)
                .body(JsonUtils.writeValueAsString(subscriptionDto))
                .post(SUBSCRIPTIONS);
    }

    public Response accountSubscriptions(String accountId) {
        return given().spec(requestSpec)
                .accept(JSON)
                .contentType(JSON)
                .get(ACCOUNT_SUBSCRIPTIONS, accountId);
    }

    public Response deleteSubscription(String accountId, String publicKey, String signature, String daoId) {
        SubscriptionDeleteDto subscriptionDto = new SubscriptionDeleteDto();
        subscriptionDto.setAccountId(accountId);
        subscriptionDto.setPublicKey(publicKey);
        subscriptionDto.setSignature(signature);

        return given().spec(requestSpec)
                .accept(ANY)
                .contentType(JSON)
                .body(JsonUtils.writeValueAsString(subscriptionDto))
                .delete(SUBSCRIPTIONS_ID, daoId);
    }
}
