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
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getIsArchived() != null, "data/notification/isArchived");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getCreatedAt() != null, "data/notification/createdAt");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getUpdatedAt() != null, "data/notification/updatedAt");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getId() != null, "data/notification/id");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getDaoId() != null, "data/notification/daoId");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getTargetId() != null, "data/notification/targetId");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getSignerId() != null, "data/notification/signerId");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getType() != null, "data/notification/type");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getStatus() != null, "data/notification/status");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getMetadata() != null, "data/notification/metadata");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getTimestamp() != null, "data/notification/timestamp");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getDao() != null, "data/notification/dao");

		List<OffsetDateTime> createdAtList = accountNotificationResponse.getData().stream().map(AccountNotification::getCreatedAt).collect(Collectors.toList());
		notificationsApiSteps.assertOffsetDateTimesAreSortedCorrectly(createdAtList, Comparator.reverseOrder(),
		                                                              "Account notifications should be sorted by 'createdAt field in DESC order");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get list of account notifications with query param: [sort, page, s]")
	@DisplayName("User should be able to get list of account notifications with query param: [sort, page, s]")
	void getListOfAccountNotificationsWithSortPageSParams() {
		int page = 10;
		Map<String, Object> queryParams = Map.of(
				"sort", "updatedAt,ASC",
				"page", page,
				"s", "{\"isPhone\":{\"$isnull\": true}, \"isEmail\":{\"$isnull\": true}}"
		);

		AccountNotificationResponse accountNotificationResponse = notificationsApiSteps.getAccountNotifications(queryParams).then()
				.statusCode(HTTP_OK)
				.extract()
				.as(AccountNotificationResponse.class);

		notificationsApiSteps.assertDtoValue(accountNotificationResponse, r -> r.getCount().intValue(), 50, "count");
		notificationsApiSteps.assertDtoValueGreaterThan(accountNotificationResponse, r -> r.getTotal().intValue(), 12838, "total");
		notificationsApiSteps.assertDtoValue(accountNotificationResponse, r -> r.getPage().intValue(), page, "page");
		notificationsApiSteps.assertDtoValueGreaterThan(accountNotificationResponse, r -> r.getPageCount().intValue(), 256, "pageCount");

		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getIsArchived() != null, "data/isArchived");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getCreatedAt() != null, "data/createdAt");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getUpdatedAt() != null, "data/updatedAt");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getId() != null, "data/id");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotificationId() != null, "data/notificationId");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getAccountId() != null, "data/accountId");
		notificationsApiSteps.assertCollectionElementsHasNoValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getIsPhone() == null, "data/isPhone");
		notificationsApiSteps.assertCollectionElementsHasNoValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getIsEmail() == null, "data/isEmail");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getIsMuted() != null, "data/isMuted");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getIsRead() != null, "data/isRead");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification() != null, "data/notification");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getIsArchived() != null, "data/notification/isArchived");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getCreatedAt() != null, "data/notification/createdAt");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getUpdatedAt() != null, "data/notification/updatedAt");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getId() != null, "data/notification/id");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getDaoId() != null, "data/notification/daoId");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getTargetId() != null, "data/notification/targetId");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getSignerId() != null, "data/notification/signerId");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getType() != null, "data/notification/type");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getStatus() != null, "data/notification/status");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getMetadata() != null, "data/notification/metadata");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getTimestamp() != null, "data/notification/timestamp");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getDao() != null, "data/notification/dao");

		List<OffsetDateTime> updatedAt = accountNotificationResponse.getData().stream().map(AccountNotification::getUpdatedAt).collect(Collectors.toList());
		notificationsApiSteps.assertOffsetDateTimesAreSortedCorrectly(updatedAt, Comparator.naturalOrder(),
		                                                              "Account notifications should be sorted by 'updatedAt field in ASC order");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get list of account notifications with query param: [sort, fields]")
	@DisplayName("User should be able to get list of account notifications with query param: [sort, fields]")
	void getListOfAccountNotificationsWithSortFieldsParams() {
		Map<String, Object> queryParams = Map.of(
				"sort", "id,DESC",
				"fields", "createdAt,id,notification"
		);

		AccountNotificationResponse accountNotificationResponse = notificationsApiSteps.getAccountNotifications(queryParams).then()
				.statusCode(HTTP_OK)
				.extract()
				.as(AccountNotificationResponse.class);

		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getCreatedAt() != null, "data/createdAt");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getId() != null, "data/id");
		notificationsApiSteps.assertCollectionElementsHasNoValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getIsArchived() == null, "data/isArchived");
		notificationsApiSteps.assertCollectionElementsHasNoValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getUpdatedAt() == null, "data/updatedAt");
		notificationsApiSteps.assertCollectionElementsHasNoValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotificationId() == null, "data/notificationId");
		notificationsApiSteps.assertCollectionElementsHasNoValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getAccountId() == null, "data/accountId");
		notificationsApiSteps.assertCollectionElementsHasNoValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getIsPhone() == null, "data/isPhone");
		notificationsApiSteps.assertCollectionElementsHasNoValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getIsEmail() == null, "data/isEmail");
		notificationsApiSteps.assertCollectionElementsHasNoValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getIsMuted() == null, "data/isMuted");
		notificationsApiSteps.assertCollectionElementsHasNoValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getIsRead() == null, "data/isRead");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification() != null, "data/notification");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getIsArchived() != null, "data/notification/isArchived");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getCreatedAt() != null, "data/notification/createdAt");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getUpdatedAt() != null, "data/notification/updatedAt");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getId() != null, "data/notification/id");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getDaoId() != null, "data/notification/daoId");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getTargetId() != null, "data/notification/targetId");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getSignerId() != null, "data/notification/signerId");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getType() != null, "data/notification/type");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getStatus() != null, "data/notification/status");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getMetadata() != null, "data/notification/metadata");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getTimestamp() != null, "data/notification/timestamp");
		notificationsApiSteps.assertCollectionElementsHasValue(accountNotificationResponse.getData(), accountNotification -> accountNotification.getNotification().getDao() != null, "data/notification/dao");

		List<String> ids = accountNotificationResponse.getData().stream().map(AccountNotification::getId).collect(Collectors.toList());
		notificationsApiSteps.assertStringsAreSortedCorrectly(ids, Comparator.reverseOrder(),
		                                                      "Account notifications should be sorted by ID in DESC order");
	}
}
