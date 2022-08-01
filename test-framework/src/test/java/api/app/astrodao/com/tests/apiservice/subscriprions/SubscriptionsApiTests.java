package api.app.astrodao.com.tests.apiservice.subscriprions;

import api.app.astrodao.com.core.utils.Base64Utils;
import api.app.astrodao.com.openapi.models.Subscription;
import api.app.astrodao.com.steps.SubscriptionsApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import com.github.javafaker.Faker;
import io.qameta.allure.*;
import io.restassured.response.Response;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.parallel.Execution;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import static java.net.HttpURLConnection.*;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.jupiter.api.parallel.ExecutionMode.SAME_THREAD;

@Tags({@Tag("all"), @Tag("subscriptionsApiTests")})
@Epic("Subscription")
@Feature("/subscriptions API tests")
@DisplayName("/subscriptions API tests")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
@Execution(SAME_THREAD)
public class SubscriptionsApiTests extends BaseTest {
    private final SubscriptionsApiSteps subscriptionsApiSteps;
    private final Faker faker;

    @Value("${accounts.account1.accountId}")
    private String accountId;

    @Value("${accounts.account1.publicKey}")
    private String accountPublicKey;

    @Value("${accounts.account1.token}")
    private String account1AuthToken;


    @BeforeAll
    public void cleanUpSubscriptions() {
        subscriptionsApiSteps.cleanUpSubscriptions(accountId, account1AuthToken);
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to subscribe to a DAO")
    @DisplayName("User should be able to subscribe to a DAO")
    void userShouldBeAbleToSubscribeToADao() {
        String dao = "marmaj.sputnikv2.testnet";
        String subscriptionId = String.format("%s-%s", dao, accountId);

        Subscription subscription = subscriptionsApiSteps.subscribeDao(account1AuthToken, dao).then()
                .statusCode(HTTP_CREATED)
                .extract().as(Subscription.class);

        subscriptionsApiSteps.assertDtoValue(subscription, Subscription::getId, subscriptionId, "id");
        subscriptionsApiSteps.assertDtoValue(subscription, Subscription::getAccountId, accountId, "accountId");
        subscriptionsApiSteps.assertDtoValue(subscription, Subscription::getDaoId, dao, "daoId");
    }

     @Test
    @Severity(SeverityLevel.NORMAL)
    @Story("User should not be able to subscribe to an invalid DAO")
    @DisplayName("User should not be able to subscribe to an invalid DAO")
    void userShouldNotBeAbleToSubscribeToInvalidDao() {
        String dao = "ewqeerdel.sputnikv2.testnet";
        String expectedResponse = String.format("No DAO '%s' and/or Account 'testdao2.testnet' found.", dao);

         subscriptionsApiSteps.subscribeDao(account1AuthToken, dao).then()
                 .statusCode(HTTP_BAD_REQUEST)
                 .body("statusCode", equalTo(HTTP_BAD_REQUEST),
                       "message", equalTo(expectedResponse),
                       "error", equalTo("Bad Request"));
    }

    @Test
    @Severity(SeverityLevel.NORMAL)
    @Story("User should not be able to delete subscription for account with invalid signature")
    @DisplayName("User should not be able to delete subscription for account with invalid signature")
    void userShouldNotBeAbleToSubscribeToDaoWithInvalidSignature() {
        String dao = "ewqeerdel.sputnikv2.testnet";
        String expectedResponse = "Invalid signature";
        String invalidSignature = faker.lorem().characters(12, 24);
        String authToken = Base64Utils.encodeAuthToken(accountId, accountPublicKey, invalidSignature);

        Response response = subscriptionsApiSteps.subscribeDao(authToken, dao);
        subscriptionsApiSteps.assertResponseStatusCode(response, HTTP_FORBIDDEN);
        subscriptionsApiSteps.assertStringContainsValue(response.body().asString(), expectedResponse);
    }
}
