package api.app.astrodao.com.tests.subscriprions;

import api.app.astrodao.com.core.dto.api.subscription.Subscriptions;
import api.app.astrodao.com.openapi.models.Subscription;
import api.app.astrodao.com.steps.SubscriptionsApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import com.github.javafaker.Faker;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@Tags({@Tag("all"), @Tag("deleteSubscriptionsApiTests")})
@Epic("Subscription")
@Feature("Delete /subscriptions/{id} API tests")
@DisplayName("Delete /subscriptions/{id} API tests")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class DeleteSubscriptionsApiTests extends BaseTest {
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
	@Story("User should be able to delete a subscription for account")
	@DisplayName("User should be able to delete a subscription for account")
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
	@DisplayName("User should not be able to delete invalid subscription for account")
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
	@DisplayName("User should not be able to delete subscription for account with invalid signature")
	void userShouldNotBeAbleToDeleteSubscriptionWithInvalidSignature() {
		String dao = "autotest.sputnikv2.testnet";
		String subscriptionId = String.format("%s-%s", dao, accountId);
		String expectedResponse = "Invalid signature";
		String invalidSignature = faker.lorem().characters(12, 24);

		ResponseEntity<String> response = subscriptionsApiSteps.deleteSubscription(accountId, accountPublicKey, invalidSignature, subscriptionId);
		subscriptionsApiSteps.assertResponseStatusCode(response, HttpStatus.FORBIDDEN);
		subscriptionsApiSteps.assertStringContainsValue(response.getBody(), expectedResponse);
	}

}
