package api.app.astrodao.com.tests.notifications;

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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.util.Map;

import static java.net.HttpURLConnection.HTTP_OK;

@Tags({@Tag("all"), @Tag("accountNotificationsIdApiTests")})
@Epic("Notifications")
@Feature("/account-notifications/{id} API tests")
@DisplayName("/account-notifications/{id} API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class AccountNotificationsIdApiTests extends BaseTest {
	private final NotificationsApiSteps notificationsApiSteps;

	@Value("${accounts.account1.accountId}")
	private String account2Id;

	@Value("${accounts.account1.token}")
	private String account2token;


	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to mute account notification by notification id")
	@DisplayName("User should be able to mute account notification by notification id")
	void muteAccountNotificationByNotificationId() {
		Map<String, Object> queryParams = Map.of(
				"limit", "1",
				"s", String.format(
						"{\"accountId\": \"%s\", \"isMuted\":false}",
						account2Id)
		);

		AccountNotificationResponse accountNotificationResponse = notificationsApiSteps.getAccountNotifications(queryParams).then()
				.statusCode(HTTP_OK)
				.extract()
				.as(AccountNotificationResponse.class);

		notificationsApiSteps.assertCollectionContainsOnly(accountNotificationResponse.getData(), AccountNotification::getIsMuted, false, "data/isMuted");
		notificationsApiSteps.assertDtoValue(accountNotificationResponse, r -> r.getCount().intValue(), 1, "count");

		String id = accountNotificationResponse.getData().get(0).getId();
		String notificationId = accountNotificationResponse.getData().get(0).getNotificationId();
		AccountNotification accountNotification = notificationsApiSteps.patchAccountNotificationsById(account2token, id, true, false, false).then()
				.statusCode(HTTP_OK)
				.extract().as(AccountNotification.class);

		notificationsApiSteps.assertDtoValue(accountNotification, AccountNotification::getId, id, "id");
		notificationsApiSteps.assertDtoValue(accountNotification, AccountNotification::getNotificationId, notificationId, "notificationId");
		notificationsApiSteps.assertDtoHasValue(accountNotification, AccountNotification::getIsArchived, "isArchived");
		notificationsApiSteps.assertDtoHasValue(accountNotification, AccountNotification::getCreatedAt, "createdAt");
		notificationsApiSteps.assertDtoHasValue(accountNotification, AccountNotification::getUpdatedAt, "updatedAt");
		notificationsApiSteps.assertDtoHasValue(accountNotification, accNotification -> accNotification.getAccountId().equals(account2Id), "accountId");
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
						account2Id)
		);

		AccountNotificationResponse accountNotificationResponse = notificationsApiSteps.getAccountNotifications(queryParams).then()
				.statusCode(HTTP_OK)
				.extract()
				.as(AccountNotificationResponse.class);

		notificationsApiSteps.assertCollectionContainsOnly(accountNotificationResponse.getData(), AccountNotification::getIsRead, false, "data/isRead");
		notificationsApiSteps.assertDtoValue(accountNotificationResponse, r -> r.getCount().intValue(), 1, "count");

		String id = accountNotificationResponse.getData().get(0).getId();
		String notificationId = accountNotificationResponse.getData().get(0).getNotificationId();
		AccountNotification accountNotification = notificationsApiSteps.patchAccountNotificationsById(account2token, id, false, true, false).then()
				.statusCode(HTTP_OK)
				.extract().as(AccountNotification.class);

		notificationsApiSteps.assertDtoValue(accountNotification, AccountNotification::getId, id, "id");
		notificationsApiSteps.assertDtoValue(accountNotification, AccountNotification::getNotificationId, notificationId, "notificationId");
		notificationsApiSteps.assertDtoHasValue(accountNotification, AccountNotification::getIsArchived, "isArchived");
		notificationsApiSteps.assertDtoHasValue(accountNotification, AccountNotification::getCreatedAt, "createdAt");
		notificationsApiSteps.assertDtoHasValue(accountNotification, AccountNotification::getUpdatedAt, "updatedAt");
		notificationsApiSteps.assertDtoHasValue(accountNotification, accNotification -> accNotification.getAccountId().equals(account2Id), "accountId");
		notificationsApiSteps.assertDtoValue(accountNotification, AccountNotification::getIsRead, true, "isRead");
		notificationsApiSteps.assertDtoHasValue(accountNotification, AccountNotification::getIsPhone, "isPhone");
		notificationsApiSteps.assertDtoHasValue(accountNotification, AccountNotification::getIsEmail, "isEmail");
		notificationsApiSteps.assertDtoHasValue(accountNotification, AccountNotification::getIsMuted, "isMuted");
		notificationsApiSteps.assertDtoHasValue(accountNotification, AccountNotification::getNotification, "notification");
	}
}
