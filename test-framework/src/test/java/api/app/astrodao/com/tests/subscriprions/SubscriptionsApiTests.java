package api.app.astrodao.com.tests.subscriprions;

import api.app.astrodao.com.core.enums.HttpStatus;
import api.app.astrodao.com.openapi.models.Subscription;
import api.app.astrodao.com.steps.SubscriptionsApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import com.github.javafaker.Faker;
import io.qameta.allure.*;
import io.restassured.response.Response;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import static java.net.HttpURLConnection.HTTP_CREATED;

@Tags({@Tag("all"), @Tag("subscriptionsApiTests")})
@Epic("Subscription")
@Feature("/subscriptions API tests")
@DisplayName("/subscriptions API tests")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class SubscriptionsApiTests extends BaseTest {
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

        Subscription subscription = subscriptionsApiSteps.subscribeDao(accountId, accountPublicKey, accountSignature, dao).then()
                .statusCode(HTTP_CREATED)
                .extract().as(Subscription.class);
//        subscriptionsApiSteps.assertResponseStatusCode(response, HttpStatus.CREATED);
//        Subscription subscription = subscriptionsApiSteps.getResponseDto(response, Subscription.class);

        subscriptionsApiSteps.assertDtoValue(subscription, Subscription::getId, subscriptionId, "id");
        subscriptionsApiSteps.assertDtoValue(subscription, Subscription::getAccountId, accountId, "accountId");
        subscriptionsApiSteps.assertDtoValue(subscription, Subscription::getDaoId, dao, "daoId");
    }

     @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to subscribe to an invalid DAO")
    void userShouldNotBeAbleToSubscribeToInvalidDao() {
        String dao = "ewqeerdel.sputnikv2.testnet";
        String expectedResponse = String.format("No DAO '%s' and/or Account 'testdao2.testnet' found.", dao);

        Response response = subscriptionsApiSteps.subscribeDao(accountId, accountPublicKey, accountSignature, dao);
        subscriptionsApiSteps.assertResponseStatusCode(response, HttpStatus.BAD_REQUEST);
        subscriptionsApiSteps.assertStringContainsValue(response.body().asString(), expectedResponse);
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should not be able to delete subscription for account with invalid signature")
    void userShouldNotBeAbleToSubscribeToDaoWithInvalidSignature() {
        String dao = "ewqeerdel.sputnikv2.testnet";
        String expectedResponse = "Invalid signature";
        String invalidSignature = faker.lorem().characters(12, 24);

        Response response = subscriptionsApiSteps.subscribeDao(accountId, accountPublicKey, invalidSignature, dao);
        subscriptionsApiSteps.assertResponseStatusCode(response, HttpStatus.FORBIDDEN);
        subscriptionsApiSteps.assertStringContainsValue(response.body().asString(), expectedResponse);
    }
}
