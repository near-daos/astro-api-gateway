package api.app.astrodao.com.tests.notifications;

import api.app.astrodao.com.openapi.models.AccountNotificationSettings;
import api.app.astrodao.com.openapi.models.AccountNotificationSettingsResponse;
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

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static java.net.HttpURLConnection.HTTP_OK;

@Tags({@Tag("all"), @Tag("notificationSettingsApiTests")})
@Epic("Notifications")
@Feature("/notification-settings API tests")
@DisplayName("/notification-settings API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class NotificationSettingsApiTests extends BaseTest {
	private final NotificationsApiSteps notificationsApiSteps;

	@Value("${test.accountId}")
	private String accountId;

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get list of notifications-settings with query param: [sort, limit, offset]")
	@DisplayName("User should be able to get list of notifications-settings with query param: [sort, limit, offset]")
	void getListOfNotificationsSettingsWithSortLimitOffsetParams() {
		int limit = 10;
		int page = 1;
		Map<String, Object> query = Map.of(
				"sort", "createdAt,DESC",
				"limit", limit,
				"offset", 0
		);

		AccountNotificationSettingsResponse notificationSettings = notificationsApiSteps.getNotificationsSettings(query).then()
				.statusCode(HTTP_OK)
				.extract().as(AccountNotificationSettingsResponse.class);

		notificationsApiSteps.assertDtoValue(notificationSettings, r -> r.getCount().intValue(), limit, "count");
		notificationsApiSteps.assertDtoValueGreaterThan(notificationSettings, r -> r.getTotal().intValue(), 334, "total");
		notificationsApiSteps.assertDtoValue(notificationSettings, r -> r.getPage().intValue(), page, "page");
		notificationsApiSteps.assertDtoValueGreaterThan(notificationSettings, r -> r.getPageCount().intValue(), 33, "pageCount");
		notificationsApiSteps.assertCollectionElementsHasValue(notificationSettings.getData(), response -> response.getId() != null, "id");
		notificationsApiSteps.assertCollectionElementsHasValue(notificationSettings.getData(), response -> response.getAccountId() != null, "accountId");
		notificationsApiSteps.assertCollectionElementsHasValue(notificationSettings.getData(), response -> response.getMutedUntilTimestamp() != null, "mutedUntilTimestamp");
		notificationsApiSteps.assertCollectionElementsHasValue(notificationSettings.getData(), response -> response.getIsAllMuted() != null, "isAllMuted");
		notificationsApiSteps.assertCollectionElementsHasValue(notificationSettings.getData(), response -> response.getTypes() != null, "types");

		List<OffsetDateTime> createdAtList = notificationSettings.getData().stream().map(AccountNotificationSettings::getCreatedAt).collect(Collectors.toList());
		notificationsApiSteps.assertOffsetDateTimesAreSortedCorrectly(createdAtList, Comparator.reverseOrder(),
		                                                              "Notifications-settings should be sorted by 'createdAt field in DESC order");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get list of notification-settings with query param: [limit, offset, page]")
	@DisplayName("User should be able to get list of notification-settings with query param: [limit, offset, page]")
	void getListOfNotificationSettingsWithLimitOffsetPageParams() {
		int limit = 50;
		int offset = 0;
		int page = 2;

		Map<String, Object> query = Map.of(
				"limit", limit,
				"offset", offset,
				"page", page
		);

		AccountNotificationSettingsResponse notificationSettings = notificationsApiSteps.getNotificationsSettings(query).then()
				.statusCode(HTTP_OK)
				.extract().as(AccountNotificationSettingsResponse.class);

		notificationsApiSteps.assertDtoValue(notificationSettings, r -> r.getCount().intValue(), limit, "count");
		notificationsApiSteps.assertDtoValueGreaterThan(notificationSettings, r -> r.getTotal().intValue(), 334, "total");
		notificationsApiSteps.assertDtoValue(notificationSettings, r -> r.getPage().intValue(), page, "page");
		notificationsApiSteps.assertDtoValueGreaterThanOrEqualTo(notificationSettings, r -> r.getPageCount().intValue(), 7, "pageCount");
		notificationsApiSteps.assertCollectionElementsHasValue(notificationSettings.getData(), response -> response.getId() != null, "id");
		notificationsApiSteps.assertCollectionElementsHasValue(notificationSettings.getData(), response -> response.getAccountId() != null, "accountId");
		notificationsApiSteps.assertCollectionElementsHasValue(notificationSettings.getData(), response -> response.getMutedUntilTimestamp() != null, "mutedUntilTimestamp");
		notificationsApiSteps.assertCollectionElementsHasValue(notificationSettings.getData(), response -> response.getIsAllMuted() != null, "isAllMuted");
		notificationsApiSteps.assertCollectionElementsHasValue(notificationSettings.getData(), response -> response.getTypes() != null, "types");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get list of notification-settings with query param: [limit, sort, fields]")
	@DisplayName("User should be able to get list of notification-settings with query param: [limit, sort, fields]")
	void getListOfNotificationSettingsWithLimitSortFieldsParams() {
		int limit = 10;
		Map<String, Object> query = Map.of(
				"limit", limit,
				"sort", "updatedAt,ASC",
				"fields", "data,updatedAt,accountId,types"
		);

		AccountNotificationSettingsResponse notificationSettings = notificationsApiSteps.getNotificationsSettings(query).then()
				.statusCode(HTTP_OK)
				.extract().as(AccountNotificationSettingsResponse.class);

		notificationsApiSteps.assertDtoValue(notificationSettings, r -> r.getCount().intValue(), limit, "count");
		notificationsApiSteps.assertCollectionElementsHasValue(notificationSettings.getData(), response -> !response.getTypes().isEmpty(), "types");
		notificationsApiSteps.assertCollectionElementsHasValue(notificationSettings.getData(), response -> !response.getId().isEmpty(), "id");
		notificationsApiSteps.assertCollectionElementsHasValue(notificationSettings.getData(), response -> !response.getAccountId().isEmpty(), "accountId");

		List<OffsetDateTime> updatedAt = notificationSettings.getData().stream().map(AccountNotificationSettings::getUpdatedAt).collect(Collectors.toList());
		notificationsApiSteps.assertOffsetDateTimesAreSortedCorrectly(updatedAt, Comparator.naturalOrder(),
		                                                              "Notifications-settings should be sorted by 'updatedAt field in ASC order");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get list of notification-settings with query param: [sort, s]")
	@DisplayName("User should be able to get list of notification-settings with query param: [sort, s]")
	void getListOfNotificationSettingsWithSortSParams() {
		Map<String, Object> query = Map.of(
				"sort", "updatedAt,DESC",
				"s", String.format("{\"accountId\": \"%s\"}", accountId)
		);

		AccountNotificationSettingsResponse notificationSettings = notificationsApiSteps.getNotificationsSettings(query).then()
				.statusCode(HTTP_OK)
				.extract().as(AccountNotificationSettingsResponse.class);

		notificationsApiSteps.assertDtoValue(notificationSettings, r -> r.getCount().intValue(), 50, "count");
		notificationsApiSteps.assertDtoValueGreaterThan(notificationSettings, r -> r.getTotal().intValue(), 271, "total");
		notificationsApiSteps.assertDtoValue(notificationSettings, r -> r.getPage().intValue(), 1, "page");
		notificationsApiSteps.assertDtoValueGreaterThanOrEqualTo(notificationSettings, r -> r.getPageCount().intValue(), 6, "pageCount");
		notificationsApiSteps.assertCollectionElementsHasValue(notificationSettings.getData(), response -> response.getId() != null, "id");
		notificationsApiSteps.assertCollectionElementsHasValue(notificationSettings.getData(), response -> response.getAccountId() != null, "accountId");
		notificationsApiSteps.assertCollectionElementsHasValue(notificationSettings.getData(), response -> response.getMutedUntilTimestamp() != null, "mutedUntilTimestamp");
		notificationsApiSteps.assertCollectionElementsHasValue(notificationSettings.getData(), response -> response.getIsAllMuted() != null, "isAllMuted");
		notificationsApiSteps.assertCollectionElementsHasValue(notificationSettings.getData(), response -> response.getTypes() != null, "types");

		List<OffsetDateTime> updatedAt = notificationSettings.getData().stream().map(AccountNotificationSettings::getUpdatedAt).collect(Collectors.toList());
		notificationsApiSteps.assertOffsetDateTimesAreSortedCorrectly(updatedAt, Comparator.reverseOrder(),
		                                                              "Notifications-settings should be sorted by 'updatedAt field in DESC order");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get list of notification-settings with query param: [filter, or]")
	@DisplayName("User should be able to get list of notification-settings with query param: [filter, or]")
	void getListOfNotificationSettingsFilterOrParams() {
		String daoId1 = "testdao1.sputnikv2.testnet";
		String daoId2 = "testdao2.sputnikv2.testnet";
		String id1 = "testdao2.testnet-testdao1.sputnikv2.testnet";
		String id2 = "testdao2.testnet-testdao2.sputnikv2.testnet";

		Map<String, Object> query = Map.of(
				"filter", "daoId||$eq||" + daoId1,
				"or", "daoId||$eq||" + daoId2
		);

		AccountNotificationSettingsResponse notificationSettings = notificationsApiSteps.getNotificationsSettings(query).then()
				.statusCode(HTTP_OK)
				.extract().as(AccountNotificationSettingsResponse.class);

		notificationsApiSteps.assertDtoValue(notificationSettings, r -> r.getCount().intValue(), 2, "count");
		notificationsApiSteps.assertDtoValue(notificationSettings, r -> r.getTotal().intValue(), 2, "total");
		notificationsApiSteps.assertDtoValue(notificationSettings, r -> r.getPage().intValue(), 1, "page");
		notificationsApiSteps.assertDtoValue(notificationSettings, r -> r.getPageCount().intValue(), 1, "pageCount");
		notificationsApiSteps.assertCollectionContainsExactlyInAnyOrder(notificationSettings.getData(), AccountNotificationSettings::getDaoId, daoId1, daoId2);
		notificationsApiSteps.assertCollectionContainsExactlyInAnyOrder(notificationSettings.getData(), AccountNotificationSettings::getId, id1, id2);
		notificationsApiSteps.assertCollectionContainsOnly(notificationSettings.getData(), AccountNotificationSettings::getAccountId, accountId, "accountId");
		notificationsApiSteps.assertCollectionElementsHasValue(notificationSettings.getData(), response -> !response.getTypes().isEmpty(), "types");
		notificationsApiSteps.assertCollectionElementsHasValue(notificationSettings.getData(), response -> response.getMutedUntilTimestamp() != null, "mutedUntilTimestamp");
		notificationsApiSteps.assertCollectionElementsHasBooleanValueAndSize(notificationSettings.getData(), AccountNotificationSettings::getIsAllMuted, "No boolean value for field:", "isAllMuted");
		notificationsApiSteps.assertCollectionElementsHasNoValue(notificationSettings.getData(), response -> response.getEnableSms() == null, "enableSms");
		notificationsApiSteps.assertCollectionElementsHasNoValue(notificationSettings.getData(), response -> response.getEnableEmail() == null, "enableEmail");

		List<OffsetDateTime> createdAtList = notificationSettings.getData().stream().map(AccountNotificationSettings::getCreatedAt).collect(Collectors.toList());
		notificationsApiSteps.assertOffsetDateTimesAreSortedCorrectly(createdAtList, Comparator.reverseOrder(),
		                                                              "Notifications-settings should be sorted by 'createdAt field in DESC order");
	}
}