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

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static java.net.HttpURLConnection.HTTP_OK;

@Tags({@Tag("all"), @Tag("accountNotificationsApiTests")})
@Epic("Notifications")
@Feature("/account-notifications API tests")
@DisplayName("/account-notifications API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class AccountNotificationsApiTests extends BaseTest {
	private final NotificationsApiSteps notificationsApiSteps;


	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get list of account notifications with query param: [sort, limit, offset]")
	@DisplayName("User should be able to get list of account notifications with query param: [sort, limit, offset]")
	void getListOfAccountNotificationsWithSortLimitOffsetParams() {
		int limit = 10;
		Map<String, Object> queryParams = Map.of(
				"sort", "createdAt,DESC",
				"limit", limit,
				"offset", 50
		);

		AccountNotificationResponse accountNotificationResponse = notificationsApiSteps.getAccountNotifications(queryParams).then()
				.statusCode(HTTP_OK)
				.extract()
				.as(AccountNotificationResponse.class);

		notificationsApiSteps.assertDtoValue(accountNotificationResponse, r -> r.getCount().intValue(), limit, "count");
		notificationsApiSteps.assertDtoValueGreaterThan(accountNotificationResponse, r -> r.getTotal().intValue(), 22870, "total");
		notificationsApiSteps.assertDtoValue(accountNotificationResponse, r -> r.getPage().intValue(), 6, "page");
		notificationsApiSteps.assertDtoValueGreaterThan(accountNotificationResponse, r -> r.getPageCount().intValue(), 2287, "pageCount");

		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getIsArchived() != null, "data/isArchived");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getCreatedAt() != null, "data/createdAt");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getUpdatedAt() != null, "data/updatedAt");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getId() != null, "data/id");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotificationId() != null, "data/notificationId");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getAccountId() != null, "data/accountId");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getIsPhone() != null, "data/isPhone");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getIsEmail() != null, "data/isEmail");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getIsMuted() != null, "data/isMuted");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getIsRead() != null, "data/isRead");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification() != null, "data/notification");

		List<OffsetDateTime> createdAtList = accountNotificationResponse.getData().stream().map(AccountNotification::getCreatedAt).collect(Collectors.toList());
		notificationsApiSteps.assertOffsetDateTimesAreSortedCorrectly(createdAtList, Comparator.reverseOrder(),
		                                                              "Account notifications should be sorted by 'createdAt field in DESC order");
	}
}
