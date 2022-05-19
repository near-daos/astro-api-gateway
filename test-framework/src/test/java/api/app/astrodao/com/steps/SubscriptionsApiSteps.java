package api.app.astrodao.com.steps;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.controllers.SubscriptionsApi;
import api.app.astrodao.com.core.dto.api.subscription.Subscriptions;
import api.app.astrodao.com.core.exceptions.EntityNotFoundException;
import api.app.astrodao.com.openapi.models.Subscription;
import io.qameta.allure.Step;
import io.restassured.response.Response;
import lombok.RequiredArgsConstructor;

import java.util.Objects;

import static java.net.HttpURLConnection.HTTP_OK;
import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;

@Steps
@RequiredArgsConstructor
public class SubscriptionsApiSteps extends BaseSteps {
    private final SubscriptionsApi subscriptionsApi;

    public void cleanUpSubscriptions(String accountId, String authToken) {
        Response response = subscriptionsApi.accountSubscriptions(accountId);
        assertResponseStatusCode(response, HTTP_OK);
        Subscriptions subscriptions = getResponseDto(response, Subscriptions.class);
        subscriptions.forEach(p -> {
            Response resp = subscriptionsApi.deleteSubscription(authToken, p.getId());
            assertResponseStatusCode(resp, HTTP_OK);
        });
    }

    @Step("User subscribes to DAO")
    public Response subscribeDao(String authToken, String daoId) {
        return subscriptionsApi.subscribeDao(authToken, daoId);
    }

    @Step("User get subscriptions")
    public Response accountSubscriptions(String accountId) {
        return subscriptionsApi.accountSubscriptions(accountId);
    }

    @Step("User deletes subscription")
    public Response deleteSubscription(String authToken, String daoId) {
        return subscriptionsApi.deleteSubscription(authToken, daoId);
    }

    public Subscription getCreatedSubscription(Subscriptions subscriptions, String subscriptionId) {
        return subscriptions.stream()
                .filter(p -> Objects.equals(p.getId(), subscriptionId)).findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Subscription not found"));
    }

    @Step("User sees subscription is not present in a list")
    public void verifySubscriptionHasBeenDeleted(Subscriptions subscriptions, String subscriptionId) {
        assertThat(subscriptions)
                .as(String.format("'%s' subscription should not be present in collection.", subscriptionId))
                .map(Subscription::getId)
                .doesNotContain(subscriptionId);
    }
}
