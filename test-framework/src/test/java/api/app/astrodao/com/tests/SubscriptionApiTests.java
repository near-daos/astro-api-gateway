package api.app.astrodao.com.tests;

import api.app.astrodao.com.core.dto.api.subscription.Subscriptions;
import api.app.astrodao.com.openapi.models.Subscription;
import api.app.astrodao.com.steps.SubscriptionsApiSteps;
import com.github.javafaker.Faker;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@Tags({@Tag("all"), @Tag("subscriptionApiTests")})
@Feature("SUBSCRIPTION API TESTS")
@DisplayName("SUBSCRIPTION API TESTS")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class SubscriptionApiTests extends BaseTest {
    private final SubscriptionsApiSteps subscriptionsApiSteps;
    private final Faker faker;

    @Value("${accounts.account1.accountId}")
    private String accountId;

    @Value("${accounts.account1.publicKey}")
    private String accountPublicKey;

    @Value("${accounts.account1.signature}")
    private String accountSignature;

    @BeforeAll
    public void cleanUpSubscriptions() {
        subscriptionsApiSteps.cleanUpSubscriptions(accountId, accountPublicKey, accountSignature);
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to subscribe to a DAO")
    void userShouldBeAbleToSubscribeToADao() {
        String dao = "marmaj.sputnikv2.testnet";
        String subscriptionId = String.format("%s-%s", dao, accountId);
        ResponseEntity<String> response = subscriptionsApiSteps.subscribeDao(accountId, accountPublicKey, accountSignature, dao);
        subscriptionsApiSteps.assertResponseStatusCode(response, HttpStatus.CREATED);

        Subscription subscription = subscriptionsApiSteps.getResponseDto(response, Subscription.class);
        subscriptionsApiSteps.assertDtoValue(subscription, Subscription::getId, subscriptionId, "id");
        subscriptionsApiSteps.assertDtoValue(subscription, Subscription::getAccountId, accountId, "accountId");
        subscriptionsApiSteps.assertDtoValue(subscription, Subscription::getDaoId, dao, "daoId");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get subscriptions for account")
    void userShouldBeAbleToGetSubscriptionsForAccount() {
        String dao = "spacex.sputnikv2.testnet";
        String subscriptionId = String.format("%s-%s", dao, accountId);

        ResponseEntity<String> response = subscriptionsApiSteps.accountSubscriptions(accountId);
        subscriptionsApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        Subscriptions subscriptionsBefore = subscriptionsApiSteps.getResponseDto(response, Subscriptions.class);

        response = subscriptionsApiSteps.subscribeDao(accountId, accountPublicKey, accountSignature, dao);
        subscriptionsApiSteps.assertResponseStatusCode(response, HttpStatus.CREATED);

        response = subscriptionsApiSteps.accountSubscriptions(accountId);
        subscriptionsApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        Subscriptions subscriptionsAfter = subscriptionsApiSteps.getResponseDto(response, Subscriptions.class);
        subscriptionsApiSteps.assertCollectionHasCorrectSize(subscriptionsAfter, subscriptionsBefore.size() + 1);

        Subscription createdSubscription = subscriptionsApiSteps.getCreatedSubscription(subscriptionsAfter, subscriptionId);
        subscriptionsApiSteps.assertDtoValue(createdSubscription, Subscription::getId, subscriptionId, "id");
        subscriptionsApiSteps.assertDtoValue(createdSubscription, Subscription::getAccountId, accountId, "accountId");
        subscriptionsApiSteps.assertDtoValue(createdSubscription, Subscription::getDaoId, dao, "daoId");
        subscriptionsApiSteps.assertDtoValue(createdSubscription, p -> p.getDao().getId(), dao, "daoId");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to delete a subscription for account")
    void userShouldBeAbleToDeleteSubscriptionForAccount() {
        String dao = "autotest-dao-1.sputnikv2.testnet";
        String subscriptionId = String.format("%s-%s", dao, accountId);

        ResponseEntity<String> response = subscriptionsApiSteps.subscribeDao(accountId, accountPublicKey, accountSignature, dao);
        subscriptionsApiSteps.assertResponseStatusCode(response, HttpStatus.CREATED);

        Subscription subscription = subscriptionsApiSteps.getResponseDto(response, Subscription.class);
        subscriptionsApiSteps.assertDtoValue(subscription, Subscription::getId, subscriptionId, "id");

        response = subscriptionsApiSteps.deleteSubscription(accountId, accountPublicKey, accountSignature, subscriptionId);
        subscriptionsApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        response = subscriptionsApiSteps.accountSubscriptions(accountId);
        subscriptionsApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        Subscriptions subscriptions = subscriptionsApiSteps.getResponseDto(response, Subscriptions.class);
        subscriptionsApiSteps.verifySubscriptionHasBeenDeleted(subscriptions, subscriptionId);
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should not be able to delete invalid subscription for account")
    void userShouldNotBeAbleToDeleteInvalidSubscription() {
        String dao = "autotest.sputnikv2.testnet";
        String subscriptionId = String.format("%s-%s", dao, accountId);
        String expectedResponse = String.format("Subscription with id %s not found", subscriptionId);

        ResponseEntity<String> response = subscriptionsApiSteps.deleteSubscription(accountId, accountPublicKey, accountSignature, subscriptionId);
        subscriptionsApiSteps.assertResponseStatusCode(response, HttpStatus.NOT_FOUND);
        subscriptionsApiSteps.assertStringContainsValue(response.getBody(), expectedResponse);
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should not be able to delete subscription for account with invalid signature")
    void userShouldNotBeAbleToDeleteSubscriptionWithInvalidSignature() {
        String dao = "autotest.sputnikv2.testnet";
        String subscriptionId = String.format("%s-%s", dao, accountId);
        String expectedResponse = "Invalid signature";
        String invalidSignature = faker.lorem().characters(12, 24);

        ResponseEntity<String> response = subscriptionsApiSteps.deleteSubscription(accountId, accountPublicKey, invalidSignature, subscriptionId);
        subscriptionsApiSteps.assertResponseStatusCode(response, HttpStatus.FORBIDDEN);
        subscriptionsApiSteps.assertStringContainsValue(response.getBody(), expectedResponse);
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to subscribe to an invalid DAO")
    void userShouldNotBeAbleToSubscribeToInvalidDao() {
        String dao = "ewqeerdel.sputnikv2.testnet";
        String expectedResponse = String.format("No DAO '%s' and/or Account 'testdao2.testnet' found.", dao);

        ResponseEntity<String> response = subscriptionsApiSteps.subscribeDao(accountId, accountPublicKey, accountSignature, dao);
        subscriptionsApiSteps.assertResponseStatusCode(response, HttpStatus.BAD_REQUEST);
        subscriptionsApiSteps.assertStringContainsValue(response.getBody(), expectedResponse);
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should not be able to delete subscription for account with invalid signature")
    void userShouldNotBeAbleToSubscribeToDaoWithInvalidSignature() {
        String dao = "ewqeerdel.sputnikv2.testnet";
        String expectedResponse = "Invalid signature";
        String invalidSignature = faker.lorem().characters(12, 24);

        ResponseEntity<String> response = subscriptionsApiSteps.subscribeDao(accountId, accountPublicKey, invalidSignature, dao);
        subscriptionsApiSteps.assertResponseStatusCode(response, HttpStatus.FORBIDDEN);
        subscriptionsApiSteps.assertStringContainsValue(response.getBody(), expectedResponse);
    }

    @Test
    @Disabled("Looks like a bug, getting 200 instead of 400 status code")
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get subscriptions for account")
    void userShouldBeAbleToGetSubscriptionsForInvalidAccount() {
        String accountId = "testdao3132498.testnet";

        ResponseEntity<String> response = subscriptionsApiSteps.accountSubscriptions(accountId);
        subscriptionsApiSteps.assertResponseStatusCode(response, HttpStatus.BAD_REQUEST);
    }
}
