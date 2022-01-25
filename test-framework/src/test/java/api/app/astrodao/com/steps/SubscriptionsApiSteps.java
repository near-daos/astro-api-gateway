package api.app.astrodao.com.steps;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.controllers.SubscriptionsApi;
import api.app.astrodao.com.core.dto.api.subscription.Subscriptions;
import api.app.astrodao.com.core.exceptions.EntityNotFoundException;
import api.app.astrodao.com.openapi.models.Subscription;
import io.qameta.allure.Step;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Objects;

import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;

@Steps
@RequiredArgsConstructor
public class SubscriptionsApiSteps extends BaseSteps {
    private final SubscriptionsApi subscriptionsApi;

    public void cleanUpSubscriptions(String accountId, String publicKey, String signature) {
        ResponseEntity<String> response = subscriptionsApi.accountSubscriptions(accountId);
        assertResponseStatusCode(response, HttpStatus.OK);
        Subscriptions subscriptions = getResponseDto(response, Subscriptions.class);
        subscriptions.forEach(p -> {
            ResponseEntity<String> resp = subscriptionsApi.deleteSubscription(accountId, publicKey, signature, p.getId());
            assertResponseStatusCode(resp, HttpStatus.OK);
        });
    }

    @Step("User subscribes to DAO")
    public ResponseEntity<String> subscribeDao(String accountId, String publicKey, String signature, String daoId) {
        return subscriptionsApi.subscribeDao(accountId, publicKey, signature, daoId);
    }

    @Step("User get subscriptions")
    public ResponseEntity<String> accountSubscriptions(String accountId) {
        return subscriptionsApi.accountSubscriptions(accountId);
    }

    @Step("User deletes subscription")
    public ResponseEntity<String> deleteSubscription(String accountId, String publicKey, String signature, String daoId) {
        return subscriptionsApi.deleteSubscription(accountId, publicKey, signature, daoId);
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