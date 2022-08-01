package api.app.astrodao.com.tests.apiservice.subscriprions;

import api.app.astrodao.com.core.dto.api.subscription.Subscriptions;
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
import static org.junit.jupiter.api.parallel.ExecutionMode.SAME_THREAD;

@Tags({@Tag("all"), @Tag("deleteSubscriptionsApiTests")})
@Epic("Subscription")
@Feature("Delete /subscriptions/{id} API tests")
@DisplayName("Delete /subscriptions/{id} API tests")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
@Execution(SAME_THREAD)
public class DeleteSubscriptionsApiTests extends BaseTest {
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
	@Story("User should be able to delete a subscription for account")
	@DisplayName("User should be able to delete a subscription for account")
	void userShouldBeAbleToDeleteSubscriptionForAccount() {
		String dao = "autotest-dao-1.sputnikv2.testnet";
		String subscriptionId = String.format("%s-%s", dao, accountId);

		Subscription subscription = subscriptionsApiSteps.subscribeDao(account1AuthToken, dao).then()
				.statusCode(HTTP_CREATED)
				.extract().as(Subscription.class);

		subscriptionsApiSteps.assertDtoValue(subscription, Subscription::getId, subscriptionId, "id");

		subscriptionsApiSteps.deleteSubscription(account1AuthToken, subscriptionId).then()
						.statusCode(HTTP_OK);

		Subscriptions subscriptions = subscriptionsApiSteps.accountSubscriptions(accountId).then()
				.statusCode(HTTP_OK)
				.extract().as(Subscriptions.class);

		subscriptionsApiSteps.verifySubscriptionHasBeenDeleted(subscriptions, subscriptionId);
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("User should not be able to delete invalid subscription for account")
	@DisplayName("User should not be able to delete invalid subscription for account")
	void userShouldNotBeAbleToDeleteInvalidSubscription() {
		String dao = "autotest.sputnikv2.testnet";
		String subscriptionId = String.format("%s-%s", dao, accountId);
		String expectedResponse = String.format("Subscription with id %s not found", subscriptionId);

		Response response = subscriptionsApiSteps.deleteSubscription(account1AuthToken, subscriptionId);
		subscriptionsApiSteps.assertResponseStatusCode(response, HTTP_NOT_FOUND);
		subscriptionsApiSteps.assertStringContainsValue(response.body().asString(), expectedResponse);
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("User should not be able to delete subscription for account with invalid signature")
	@DisplayName("User should not be able to delete subscription for account with invalid signature")
	void userShouldNotBeAbleToDeleteSubscriptionWithInvalidSignature() {
		String dao = "autotest.sputnikv2.testnet";
		String subscriptionId = String.format("%s-%s", dao, accountId);
		String expectedResponse = "Invalid signature";
		String invalidSignature = faker.lorem().characters(12, 24);
		String authToken = Base64Utils.encodeAuthToken(accountId, accountPublicKey, invalidSignature);

		Response response = subscriptionsApiSteps.deleteSubscription(authToken, subscriptionId);
		subscriptionsApiSteps.assertResponseStatusCode(response, HTTP_FORBIDDEN);
		subscriptionsApiSteps.assertStringContainsValue(response.body().asString(), expectedResponse);
	}

}
