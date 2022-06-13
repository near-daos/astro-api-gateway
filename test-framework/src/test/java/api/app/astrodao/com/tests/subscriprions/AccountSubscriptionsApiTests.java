package api.app.astrodao.com.tests.subscriprions;

import api.app.astrodao.com.core.dto.api.subscription.Subscriptions;
import api.app.astrodao.com.openapi.models.Subscription;
import api.app.astrodao.com.steps.SubscriptionsApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.parallel.Execution;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import static java.net.HttpURLConnection.*;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.jupiter.api.parallel.ExecutionMode.SAME_THREAD;

@Tags({@Tag("all"), @Tag("accountSubscriptionsApiTests")})
@Epic("Subscription")
@Feature("/subscriptions/account-subscriptions/{accountId} API tests")
@DisplayName("/subscriptions/account-subscriptions/{accountId} API tests")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
@Execution(SAME_THREAD)
public class AccountSubscriptionsApiTests extends BaseTest {
	private final SubscriptionsApiSteps subscriptionsApiSteps;

	@Value("${accounts.account1.accountId}")
	private String accountId;

	@Value("${accounts.account1.token}")
	private String account1AuthToken;

	@BeforeAll
	public void cleanUpSubscriptions() {
		subscriptionsApiSteps.cleanUpSubscriptions(accountId, account1AuthToken);
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get subscriptions for account")
	@DisplayName("User should be able to get subscriptions for account")
	void userShouldBeAbleToGetSubscriptionsForAccount() {
		String dao = "spacex.sputnikv2.testnet";
		String subscriptionId = String.format("%s-%s", dao, accountId);

		Subscriptions subscriptionsBefore = subscriptionsApiSteps.accountSubscriptions(accountId).then()
				.statusCode(HTTP_OK)
				.extract().as(Subscriptions.class);

		subscriptionsApiSteps.subscribeDao(account1AuthToken, dao).then()
				.statusCode(HTTP_CREATED);

		Subscriptions subscriptionsAfter = subscriptionsApiSteps.accountSubscriptions(accountId).then()
				.statusCode(HTTP_OK)
				.extract().as(Subscriptions.class);

		subscriptionsApiSteps.assertCollectionHasCorrectSize(subscriptionsAfter, subscriptionsBefore.size() + 1);

		Subscription createdSubscription = subscriptionsApiSteps.getCreatedSubscription(subscriptionsAfter, subscriptionId);
		subscriptionsApiSteps.assertDtoValue(createdSubscription, Subscription::getId, subscriptionId, "id");
		subscriptionsApiSteps.assertDtoValue(createdSubscription, Subscription::getAccountId, accountId, "accountId");
		subscriptionsApiSteps.assertDtoValue(createdSubscription, Subscription::getDaoId, dao, "daoId");
		subscriptionsApiSteps.assertDtoValue(createdSubscription, p -> p.getDao().getId(), dao, "daoId");
	}

	@ParameterizedTest
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 404 for account-subscriptions with invalid accountId")
	@DisplayName("Get HTTP 404 for account-subscriptions with invalid accountId")
	@CsvSource({"invalidAccountId", "2212332141", "-1", "0", "testdao3132498.testnet",
			"*", "autotest-dao-1.sputnikv2.testnet-1", "another-magic.near"})
	void getHttp404ForAccountSubscriptionsWithInvalidAccountId(String accountIdParam) {
		String errorMessage = String.format("Account does not exist: %s", accountIdParam);

		subscriptionsApiSteps.accountSubscriptions(accountIdParam).then()
				.statusCode(HTTP_NOT_FOUND)
				.body("statusCode", equalTo(HTTP_NOT_FOUND),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Not Found"));
	}
}
