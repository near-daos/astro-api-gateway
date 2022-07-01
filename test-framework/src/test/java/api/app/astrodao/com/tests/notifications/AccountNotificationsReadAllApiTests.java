package api.app.astrodao.com.tests.notifications;

import api.app.astrodao.com.core.utils.Base64Utils;
import api.app.astrodao.com.openapi.models.AccountNotification;
import api.app.astrodao.com.openapi.models.NotificationStatusResponse;
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

import static api.app.astrodao.com.core.Constants.Variables.EMPTY_STRING;
import static java.net.HttpURLConnection.HTTP_FORBIDDEN;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("accountNotificationsReadAllApiTests")})
@Epic("Notifications")
@Feature("/account-notifications/read-all API tests")
@DisplayName("/account-notifications/read-all API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class AccountNotificationsReadAllApiTests extends BaseTest {
	private final NotificationsApiSteps notificationsApiSteps;


	@Value("${accounts.account2.accountId}")
	private String account2Id;

	@Value("${accounts.account2.token}")
	private String account2token;

	@Value("${accounts.account2.publicKey}")
	private String accountPublicKey;

	@Value("${accounts.account2.signature}")
	private String accountSignature;


	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to read all account notifications")
	@DisplayName("User should be able to read all account notifications")
	void readAllAccountNotifications() {
		NotificationStatusResponse notificationStatus;
		//number of notifications >= 1
		notificationStatus = notificationsApiSteps.getAccountNotificationStatus(account2Id).then()
				.statusCode(HTTP_OK)
				.extract().as(NotificationStatusResponse.class);

		notificationsApiSteps.assertDtoValueGreaterThanOrEqualTo(
				notificationStatus, notificationStatusResponse -> notificationStatusResponse.getUnreadCount().intValue(), 1, "unreadCount");

		//read all
		notificationsApiSteps.patchReadAllAccountNotifications(account2token).then().statusCode(HTTP_OK);

		// number of notifications == 0
		notificationStatus = notificationsApiSteps.getAccountNotificationStatus(account2Id).then()
				.statusCode(HTTP_OK)
				.extract().as(NotificationStatusResponse.class);

		notificationsApiSteps.assertDtoValue(notificationStatus, notificationStatusResponse -> notificationStatusResponse.getUnreadCount().intValue(), 0, "unreadCount");

		//unread notification
		String notificationId = "automation-01.testnet-4svi8zsqwzk5kan68mc8gvpaueqjgshn8zg7et9mu41a-vote";
		AccountNotification accountNotification = notificationsApiSteps.patchAccountNotificationsById(account2token, notificationId, false, false, false).then()
				.statusCode(HTTP_OK)
				.extract().as(AccountNotification.class);

		notificationsApiSteps.assertDtoValue(accountNotification, AccountNotification::getIsMuted, false, "isMuted");
		notificationsApiSteps.assertDtoValue(accountNotification, AccountNotification::getIsRead, false, "isRead");
		notificationsApiSteps.assertDtoValue(accountNotification, AccountNotification::getIsArchived, false, "isArchived");

		// number of notifications == 1
		notificationStatus = notificationsApiSteps.getAccountNotificationStatus(account2Id).then()
				.statusCode(HTTP_OK)
				.extract().as(NotificationStatusResponse.class);

		notificationsApiSteps.assertDtoHasValue(notificationStatus, NotificationStatusResponse::getAccountId, account2Id);
		notificationsApiSteps.assertDtoValue(notificationStatus, notificationStatusResponse -> notificationStatusResponse.getUnreadCount().intValue(), 1, "unreadCount");
	}

	@ParameterizedTest
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for read all account notifications endpoint with null and invalid 'accountId' parameter")
	@DisplayName("Get HTTP 403 for read all account notifications endpoint with null and invalid 'accountId' parameter")
	@NullSource
	@CsvSource({"astro-automation.testnet", "another-magic.near", "test-dao-1641395769436.sputnikv2.testnet"})
	void getHttp403ForReadAllAccountNotificationsEndpointWithNullAndInvalidAccountIdParam(String accountId) {
		String authToken = Base64Utils.encodeAuthToken(accountId, accountPublicKey, accountSignature);
		String errorMessage = String.format("Account %s identity is invalid - public key", accountId);

		notificationsApiSteps.patchReadAllAccountNotifications(authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for read all account notifications endpoint with empty 'accountId' parameter")
	@DisplayName("Get HTTP 403 for read all account notifications endpoint with empty 'accountId' parameter")
	void getHttp403ForReadAllAccountNotificationsEndpointWithEmptyAccountIdParam() {
		String authToken = Base64Utils.encodeAuthToken(EMPTY_STRING, accountPublicKey, accountSignature);

		notificationsApiSteps.patchReadAllAccountNotifications(authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@ParameterizedTest
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for read all account notifications endpoint with null and invalid 'publicKey' parameter")
	@DisplayName("Get HTTP 403 for read all account notifications endpoint with null and invalid 'publicKey' parameter")
	@NullSource
	@CsvSource({"invalidPublicKey"})
	void getHttp403ForReadAllAccountNotificationsEndpointWithNullAndInvalidPublicKeyParam(String publicKey) {
		String authToken = Base64Utils.encodeAuthToken(account2Id, publicKey, accountSignature);

		notificationsApiSteps.patchReadAllAccountNotifications(authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo(String.format("Account %s identity is invalid - public key", account2Id)),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for read all account notifications endpoint with empty 'publicKey' parameter")
	@DisplayName("Get HTTP 403 for read all account notifications endpoint with empty 'publicKey' parameter")
	void getHttp403ForReadAllAccountNotificationsEndpointWithEmptyPublicKeyParam() {
		String authToken = Base64Utils.encodeAuthToken(account2Id, EMPTY_STRING, accountSignature);

		notificationsApiSteps.patchReadAllAccountNotifications(authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}
}
