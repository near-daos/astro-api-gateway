package api.app.astrodao.com.tests.apiservice.notifications;

import api.app.astrodao.com.openapi.models.NotificationStatusResponse;
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

import static java.net.HttpURLConnection.HTTP_OK;

@Tags({@Tag("all"), @Tag("accountNotificationStatusApiTests")})
@Epic("Notifications")
@Feature("/account-notification-status/{accountId} API tests")
@DisplayName("/account-notification-status/{accountId} API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class AccountNotificationStatusApiTests extends BaseTest {
	private final NotificationsApiSteps notificationsApiSteps;

	@Value("${accounts.account1.accountId}")
	private String account1Id;

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get notification status by [accountId] param")
	@DisplayName("User should be able to get notification status by [accountId] param")
	void getNotificationStatusByAccountIdParam() {
		NotificationStatusResponse notificationStatus =
				notificationsApiSteps.getAccountNotificationStatus(account1Id).then()
						.statusCode(HTTP_OK)
						.extract().as(NotificationStatusResponse.class);

		notificationsApiSteps.assertDtoHasValue(notificationStatus, NotificationStatusResponse::getAccountId, account1Id);
		notificationsApiSteps.assertDtoValueGreaterThan(notificationStatus, notificationStatusResponse -> notificationStatusResponse.getUnreadCount().intValue(), 5074, "unreadCount");
	}
}
