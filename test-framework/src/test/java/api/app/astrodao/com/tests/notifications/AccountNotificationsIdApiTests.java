package api.app.astrodao.com.tests.notifications;

import api.app.astrodao.com.core.utils.Base64Utils;
import api.app.astrodao.com.openapi.models.AccountNotification;
import api.app.astrodao.com.openapi.models.AccountNotificationResponse;
import api.app.astrodao.com.steps.NotificationsApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.NullSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.util.Map;

import static api.app.astrodao.com.core.Constants.Variables.EMPTY_STRING;
import static java.net.HttpURLConnection.*;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("accountNotificationsIdApiTests")})
@Epic("Notifications")
@Feature("/account-notifications/{id} API tests")
@DisplayName("/account-notifications/{id} API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class AccountNotificationsIdApiTests extends BaseTest {
	private final NotificationsApiSteps notificationsApiSteps;

	@Value("${accounts.account1.accountId}")
	private String accountId;

	@Value("${accounts.account1.token}")
	private String accountToken;

	@Value("${accounts.account1.publicKey}")
	private String accountPublicKey;

	@Value("${accounts.account1.signature}")
	private String accountSignature;


	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to mute account notification by notification id")
	@DisplayName("User should be able to mute account notification by notification id")
	void muteAccountNotificationByNotificationId() {
		Map<String, Object> queryParams = Map.of(
				"limit", "1",
				"s", String.format(
						"{\"accountId\": \"%s\", \"isMuted\":false}",
						accountId)
		);

		AccountNotificationResponse accountNotificationResponse = notificationsApiSteps.getAccountNotifications(queryParams).then()
				.statusCode(HTTP_OK)
				.extract()
				.as(AccountNotificationResponse.class);

		notificationsApiSteps.assertCollectionContainsOnly(accountNotificationResponse.getData(), AccountNotification::getIsMuted, false, "data/isMuted");
		notificationsApiSteps.assertDtoValue(accountNotificationResponse, r -> r.getCount().intValue(), 1, "count");

		String id = accountNotificationResponse.getData().get(0).getId();
		String notificationId = accountNotificationResponse.getData().get(0).getNotificationId();
		AccountNotification accountNotification = notificationsApiSteps.patchAccountNotificationsById(accountToken, id, true, false, false).then()
				.statusCode(HTTP_OK)
				.extract().as(AccountNotification.class);

		notificationsApiSteps.assertDtoValue(accountNotification, AccountNotification::getId, id, "id");
		notificationsApiSteps.assertDtoValue(accountNotification, AccountNotification::getNotificationId, notificationId, "notificationId");
		notificationsApiSteps.assertDtoHasValue(accountNotification, AccountNotification::getIsArchived, "isArchived");
		notificationsApiSteps.assertDtoHasValue(accountNotification, AccountNotification::getCreatedAt, "createdAt");
		notificationsApiSteps.assertDtoHasValue(accountNotification, AccountNotification::getUpdatedAt, "updatedAt");
		notificationsApiSteps.assertDtoHasValue(accountNotification, accNotification -> accNotification.getAccountId().equals(accountId), "accountId");
		notificationsApiSteps.assertDtoValue(accountNotification, AccountNotification::getIsMuted, true, "isMuted");
		notificationsApiSteps.assertDtoHasValue(accountNotification, AccountNotification::getIsPhone, "isPhone");
		notificationsApiSteps.assertDtoHasValue(accountNotification, AccountNotification::getIsEmail, "isEmail");
		notificationsApiSteps.assertDtoHasValue(accountNotification, AccountNotification::getIsRead, "isRead");
		notificationsApiSteps.assertDtoHasValue(accountNotification, AccountNotification::getNotification, "notification");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to mark as read account notification by notification id")
	@DisplayName("User should be able to mark as read account notification by notification id")
	void markAsReadAccountNotificationByNotificationId() {
		Map<String, Object> queryParams = Map.of(
				"limit", "1",
				"s", String.format(
						"{\"accountId\": \"%s\", \"isRead\":false}",
						accountId)
		);

		AccountNotificationResponse accountNotificationResponse = notificationsApiSteps.getAccountNotifications(queryParams).then()
				.statusCode(HTTP_OK)
				.extract()
				.as(AccountNotificationResponse.class);

		notificationsApiSteps.assertCollectionContainsOnly(accountNotificationResponse.getData(), AccountNotification::getIsRead, false, "data/isRead");
		notificationsApiSteps.assertDtoValue(accountNotificationResponse, r -> r.getCount().intValue(), 1, "count");

		String id = accountNotificationResponse.getData().get(0).getId();
		String notificationId = accountNotificationResponse.getData().get(0).getNotificationId();
		AccountNotification accountNotification = notificationsApiSteps.patchAccountNotificationsById(accountToken, id, false, true, false).then()
				.statusCode(HTTP_OK)
				.extract().as(AccountNotification.class);

		notificationsApiSteps.assertDtoValue(accountNotification, AccountNotification::getId, id, "id");
		notificationsApiSteps.assertDtoValue(accountNotification, AccountNotification::getNotificationId, notificationId, "notificationId");
		notificationsApiSteps.assertDtoHasValue(accountNotification, AccountNotification::getIsArchived, "isArchived");
		notificationsApiSteps.assertDtoHasValue(accountNotification, AccountNotification::getCreatedAt, "createdAt");
		notificationsApiSteps.assertDtoHasValue(accountNotification, AccountNotification::getUpdatedAt, "updatedAt");
		notificationsApiSteps.assertDtoHasValue(accountNotification, accNotification -> accNotification.getAccountId().equals(accountId), "accountId");
		notificationsApiSteps.assertDtoValue(accountNotification, AccountNotification::getIsRead, true, "isRead");
		notificationsApiSteps.assertDtoHasValue(accountNotification, AccountNotification::getIsPhone, "isPhone");
		notificationsApiSteps.assertDtoHasValue(accountNotification, AccountNotification::getIsEmail, "isEmail");
		notificationsApiSteps.assertDtoHasValue(accountNotification, AccountNotification::getIsMuted, "isMuted");
		notificationsApiSteps.assertDtoHasValue(accountNotification, AccountNotification::getNotification, "notification");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to archive account notification by notification id")
	@DisplayName("User should be able to archive account notification by notification id")
	void archiveAccountNotificationByNotificationId() {
		Map<String, Object> queryParams = Map.of(
				"limit", "1",
				"s", String.format(
						"{\"accountId\": \"%s\", \"isArchived\":false}",
						accountId)
		);

		AccountNotificationResponse accountNotificationResponse = notificationsApiSteps.getAccountNotifications(queryParams).then()
				.statusCode(HTTP_OK)
				.extract()
				.as(AccountNotificationResponse.class);

		notificationsApiSteps.assertCollectionContainsOnly(accountNotificationResponse.getData(), AccountNotification::getIsArchived, false, "data/isArchived");
		notificationsApiSteps.assertDtoValue(accountNotificationResponse, r -> r.getCount().intValue(), 1, "count");

		String id = accountNotificationResponse.getData().get(0).getId();
		String notificationId = accountNotificationResponse.getData().get(0).getNotificationId();
		AccountNotification accountNotification = notificationsApiSteps.patchAccountNotificationsById(accountToken, id, false, false, true).then()
				.statusCode(HTTP_OK)
				.extract().as(AccountNotification.class);

		notificationsApiSteps.assertDtoValue(accountNotification, AccountNotification::getId, id, "id");
		notificationsApiSteps.assertDtoValue(accountNotification, AccountNotification::getNotificationId, notificationId, "notificationId");
		notificationsApiSteps.assertDtoValue(accountNotification, AccountNotification::getIsArchived, true, "isArchived");
		notificationsApiSteps.assertDtoHasValue(accountNotification, AccountNotification::getCreatedAt, "createdAt");
		notificationsApiSteps.assertDtoHasValue(accountNotification, AccountNotification::getUpdatedAt, "updatedAt");
		notificationsApiSteps.assertDtoHasValue(accountNotification, accNotification -> accNotification.getAccountId().equals(accountId), "accountId");
		notificationsApiSteps.assertDtoHasValue(accountNotification, AccountNotification::getIsRead, "isRead");
		notificationsApiSteps.assertDtoHasValue(accountNotification, AccountNotification::getIsPhone, "isPhone");
		notificationsApiSteps.assertDtoHasValue(accountNotification, AccountNotification::getIsEmail, "isEmail");
		notificationsApiSteps.assertDtoHasValue(accountNotification, AccountNotification::getIsMuted, "isMuted");
		notificationsApiSteps.assertDtoHasValue(accountNotification, AccountNotification::getNotification, "notification");
	}

	@ParameterizedTest
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for account notifications id endpoint with null and invalid 'accountId' parameter")
	@DisplayName("Get HTTP 403 for account notifications id endpoint with null and invalid 'accountId' parameter")
	@NullSource
	@CsvSource({"astro-automation.testnet", "another-magic.near", "test-dao-1641395769436.sputnikv2.testnet"})
	void getHttp403ForAccountNotificationsIdEndpointWithNullAndInvalidAccountIdParam(String accountId) {
		String authToken = Base64Utils.encodeAuthToken(accountId, accountPublicKey, accountSignature);
		String errorMessage = String.format("Account %s identity is invalid - public key", accountId);

		String id = "testdao2.testnet-fgflgxxo7okrakcfwhxagzfcxdigua5nqcktvsqnnt3w-changeconfig";
		notificationsApiSteps.patchAccountNotificationsById(authToken, id, true, true, true).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for account notifications id endpoint with empty 'accountId' parameter")
	@DisplayName("Get HTTP 403 for account notifications id endpoint with empty 'accountId' parameter")
	void getHttp403ForAccountNotificationsIdEndpointWithEmptyAccountIdParam() {
		String authToken = Base64Utils.encodeAuthToken(EMPTY_STRING, accountPublicKey, accountSignature);

		String id = "testdao2.testnet-fgflgxxo7okrakcfwhxagzfcxdigua5nqcktvsqnnt3w-changeconfig";
		notificationsApiSteps.patchAccountNotificationsById(authToken, id, true, true, true).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@ParameterizedTest
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for account notifications id endpoint with null and invalid 'publicKey' parameter")
	@DisplayName("Get HTTP 403 for account notifications id endpoint with null and invalid 'publicKey' parameter")
	@NullSource
	@CsvSource({"invalidPublicKey"})
	void getHttp403ForAccountNotificationsIdEndpointWithNullAndInvalidPublicKeyParam(String publicKey) {
		String authToken = Base64Utils.encodeAuthToken(accountId, publicKey, accountSignature);

		String id = "testdao2.testnet-fgflgxxo7okrakcfwhxagzfcxdigua5nqcktvsqnnt3w-changeconfig";
		notificationsApiSteps.patchAccountNotificationsById(authToken, id, true, true, true).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo(String.format("Account %s identity is invalid - public key", accountId)),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for account notifications id endpoint with empty 'publicKey' parameter")
	@DisplayName("Get HTTP 403 for account notifications id endpoint with empty 'publicKey' parameter")
	void getHttp403ForAccountNotificationsIdEndpointWithEmptyPublicKeyParam() {
		String authToken = Base64Utils.encodeAuthToken(accountId, EMPTY_STRING, accountSignature);

		String id = "testdao2.testnet-fgflgxxo7okrakcfwhxagzfcxdigua5nqcktvsqnnt3w-changeconfig";
		notificationsApiSteps.patchAccountNotificationsById(authToken, id, true, true, true).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for account notifications id endpoint with invalid 'signature' parameter")
	@DisplayName("Get HTTP 403 for account notifications id endpoint with invalid 'signature' parameter")
	void getHttp403ForAccountNotificationsIdEndpointWithInvalidSignatureParam() {
		String invalidSignature = accountSignature.substring(10);
		String authToken = Base64Utils.encodeAuthToken(accountId, accountPublicKey, invalidSignature);

		String id = "testdao2.testnet-fgflgxxo7okrakcfwhxagzfcxdigua5nqcktvsqnnt3w-changeconfig";
		notificationsApiSteps.patchAccountNotificationsById(authToken, id, true, true, true).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Invalid signature"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for account notifications id endpoint with null 'signature' parameter")
	@DisplayName("Get HTTP 403 for account notifications id endpoint with null 'signature' parameter")
	void getHttp403ForAccountNotificationsIdEndpointWithNullSignatureParam() {
		String authToken = Base64Utils.encodeAuthToken(accountId, accountPublicKey, null);

		String id = "testdao2.testnet-fgflgxxo7okrakcfwhxagzfcxdigua5nqcktvsqnnt3w-changeconfig";
		notificationsApiSteps.patchAccountNotificationsById(authToken, id, true, true, true).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Invalid signature"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for account notifications id endpoint with empty 'signature' parameter")
	@DisplayName("Get HTTP 403 for account notifications id endpoint with empty 'signature' parameter")
	void getHttp403ForAccountNotificationsIdEndpointWithEmptySignatureParam() {
		String authToken = Base64Utils.encodeAuthToken(accountId, accountPublicKey, EMPTY_STRING);

		String id = "testdao2.testnet-fgflgxxo7okrakcfwhxagzfcxdigua5nqcktvsqnnt3w-changeconfig";
		notificationsApiSteps.patchAccountNotificationsById(authToken, id, true, true, true).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@ParameterizedTest
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 400 for account notification with not valid id")
	@DisplayName("Get HTTP 400 for account notification with not valid id")
	@CsvSource({"invalidId", "2212332141", "-1", "0",
			"*", "null", "autotest-dao-1.sputnikv2.testnet-1", "another-magic.near",
			"test-dao-1641395769436.sputnikv2.testnet-3184", "test-dao-1641395769436.sputnikv2.testnet", "testdao2.testnet",
			"testdao2.testnet-fgflgxxo7okrakcfwhxagzfcxdigua5nqcktvsqnnt3w-vote"})
	void getHttp400ForAccountNotificationId(String id) {
		notificationsApiSteps.patchAccountNotificationsById(accountToken, id, true, true, true).then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo("Invalid Account Notification ID"),
				      "error", equalTo("Bad Request"));
	}
}
