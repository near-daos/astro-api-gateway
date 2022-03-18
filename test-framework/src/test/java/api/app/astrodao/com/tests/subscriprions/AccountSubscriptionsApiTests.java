package api.app.astrodao.com.tests.subscriprions;

import api.app.astrodao.com.core.dto.api.subscription.Subscriptions;
import api.app.astrodao.com.openapi.models.Subscription;
import api.app.astrodao.com.steps.SubscriptionsApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import io.restassured.response.Response;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import api.app.astrodao.com.core.enums.HttpStatus;

@Tags({@Tag("all"), @Tag("accountSubscriptionsApiTests")})
@Epic("Subscription")
@Feature("/subscriptions/account-subscriptions/{accountId} API tests")
@DisplayName("/subscriptions/account-subscriptions/{accountId} API tests")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class AccountSubscriptionsApiTests extends BaseTest {
	private final SubscriptionsApiSteps subscriptionsApiSteps;

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
	@Story("User should be able to get subscriptions for account")
	@DisplayName("User should be able to get subscriptions for account")
	void userShouldBeAbleToGetSubscriptionsForAccount() {
		String dao = "spacex.sputnikv2.testnet";
		String subscriptionId = String.format("%s-%s", dao, accountId);

		Response response = subscriptionsApiSteps.accountSubscriptions(accountId);
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
	@Story("User should be able to get empty subscriptions for invalid account")
	@DisplayName("User should be able to get empty subscriptions for invalid account")
	void userShouldBeAbleToGetSubscriptionsForInvalidAccount() {
		String accountId = "testdao3132498.testnet";

		Response response = subscriptionsApiSteps.accountSubscriptions(accountId);
		subscriptionsApiSteps.assertResponseStatusCode(response, HttpStatus.OK);
		subscriptionsApiSteps.assertStringContainsValue(response.body().asString(), "[]");
	}
}
