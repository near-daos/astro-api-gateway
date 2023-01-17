package api.app.astrodao.com.tests.apiservice.notifications;

import api.app.astrodao.com.core.dto.api.dao.AccountDAOs;
import api.app.astrodao.com.core.utils.Base64Utils;
import api.app.astrodao.com.openapi.models.AccountNotificationSettings;
import api.app.astrodao.com.openapi.models.AccountNotificationSettingsResponse;
import api.app.astrodao.com.steps.apiservice.DaoApiSteps;
import api.app.astrodao.com.steps.apiservice.NotificationsApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import com.github.javafaker.Faker;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.EmptySource;
import org.junit.jupiter.params.provider.NullSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static api.app.astrodao.com.core.Constants.Variables.EMPTY_STRING;
import static java.net.HttpURLConnection.*;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("notificationSettingsApiTests")})
@Epic("Notifications")
@Feature("/notification-settings API tests")
@DisplayName("/notification-settings API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class NotificationSettingsApiTests extends BaseTest {
	private final NotificationsApiSteps notificationsApiSteps;
	private final DaoApiSteps daoApiSteps;
	private final Faker faker;

	@Value("${accounts.account1.accountId}")
	private String accountId;

	@Value("${accounts.account1.publicKey}")
	private String accountPublicKey;

	@Value("${accounts.account1.signature}")
	private String accountSignature;

	@Value("${accounts.account1.token}")
	private String accountToken;


	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get list of notifications settings with query param: [sort, limit, offset]")
	@DisplayName("User should be able to get list of notifications settings with query param: [sort, limit, offset]")
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
	@Story("User should be able to get list of notification settings with query param: [limit, offset, page]")
	@DisplayName("User should be able to get list of notification settings with query param: [limit, offset, page]")
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
	@Story("User should be able to get list of notification settings with query param: [limit, sort, fields]")
	@DisplayName("User should be able to get list of notification settings with query param: [limit, sort, fields]")
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
	@Story("User should be able to get list of notification settings with query param: [sort, s]")
	@DisplayName("User should be able to get list of notification settings with query param: [sort, s]")
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
		notificationsApiSteps.assertCollectionContainsOnly(notificationSettings.getData(), AccountNotificationSettings::getAccountId, accountId, "accountId");
		notificationsApiSteps.assertCollectionElementsHasValue(notificationSettings.getData(), response -> response.getMutedUntilTimestamp() != null, "mutedUntilTimestamp");
		notificationsApiSteps.assertCollectionElementsHasValue(notificationSettings.getData(), response -> response.getIsAllMuted() != null, "isAllMuted");
		notificationsApiSteps.assertCollectionElementsHasValue(notificationSettings.getData(), response -> response.getTypes() != null, "types");

		List<OffsetDateTime> updatedAt = notificationSettings.getData().stream().map(AccountNotificationSettings::getUpdatedAt).collect(Collectors.toList());
		notificationsApiSteps.assertOffsetDateTimesAreSortedCorrectly(updatedAt, Comparator.reverseOrder(),
		                                                              "Notifications-settings should be sorted by 'updatedAt field in DESC order");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get list of notification settings with query param: [filter, or]")
	@DisplayName("User should be able to get list of notification settings with query param: [filter, or]")
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
		notificationsApiSteps.assertCollectionElementsHasValue(notificationSettings.getData(), response -> new BigDecimal(response.getMutedUntilTimestamp()).longValue() >= 0, "mutedUntilTimestamp");
		notificationsApiSteps.assertCollectionContainsExactlyInAnyOrder(notificationSettings.getData(), AccountNotificationSettings::getIsAllMuted, true, false);

		List<OffsetDateTime> createdAtList = notificationSettings.getData().stream().map(AccountNotificationSettings::getCreatedAt).collect(Collectors.toList());
		notificationsApiSteps.assertOffsetDateTimesAreSortedCorrectly(createdAtList, Comparator.reverseOrder(),
		                                                              "Notifications settings should be sorted by 'createdAt field in DESC order");
	}

	@ParameterizedTest
	@CsvSource(value = {
			"sort; createdAt,DES; Invalid sort order. ASC,DESC expected",
			"limit; -50; LIMIT must not be negative",
			"offset; -5; OFFSET must not be negative",
			"page; -2; PAGE must not be negative",
			"s; query; Invalid search param. JSON expected"
	}, delimiter = 59)
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 400 status code for notification settings")
	@DisplayName("Get HTTP 400 status code for notification settings")
	void getHttp400StatusCodeForNotificationSettings(String key, String value, String errorMsg) {
		Map<String, Object> query = Map.of(key, value);

		notificationsApiSteps.getNotificationsSettings(query).then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo(errorMsg));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to create account notification settings")
	@DisplayName("User should be able to create account notification settings")
	void createAccountNotificationSettings() {
		AccountDAOs accountDaos = daoApiSteps.getAccountDaos(accountId).then()
				.statusCode(HTTP_OK)
				.extract().as(AccountDAOs.class);

		int accountRandomDao = faker.random().nextInt(0, accountDaos.size());
		String daoId = accountDaos.get(accountRandomDao).getId();
		List<String> types = List.of("CustomDao", "AddMemberToRole", "FunctionCall", "Transfer", "AddBounty", "Vote");

		AccountNotificationSettings accountNotificationSettings =
				notificationsApiSteps.setNotificationSettings(accountToken, daoId, types, "0", false, false, false, false).then()
						.statusCode(HTTP_CREATED)
						.extract().as(AccountNotificationSettings.class);

		String id = accountId + "-" + daoId;
		notificationsApiSteps.assertDtoValue(accountNotificationSettings, AccountNotificationSettings::getId, id, "id");
		notificationsApiSteps.assertDtoValue(accountNotificationSettings, AccountNotificationSettings::getAccountId, accountId, "accountId");
		notificationsApiSteps.assertDtoValue(accountNotificationSettings, AccountNotificationSettings::getDaoId, daoId, "daoId");
		notificationsApiSteps.assertCollectionsAreEqual(accountNotificationSettings.getTypes(), types);
		notificationsApiSteps.assertDtoValue(accountNotificationSettings, AccountNotificationSettings::getMutedUntilTimestamp, "0", "mutedUntilTimestamp");
		notificationsApiSteps.assertDtoValue(accountNotificationSettings, AccountNotificationSettings::getIsAllMuted, false, "isAllMuted");
		notificationsApiSteps.assertDtoValue(accountNotificationSettings, AccountNotificationSettings::getEnableSms, false, "enableSms");
		notificationsApiSteps.assertDtoValue(accountNotificationSettings, AccountNotificationSettings::getEnableEmail, false, "enableEmail");
		notificationsApiSteps.assertDtoHasValue(accountNotificationSettings, AccountNotificationSettings::getUpdatedAt, "updatedAt");
	}

	@ParameterizedTest
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for account notification settings with null and invalid 'publicKey' parameter")
	@DisplayName("Get HTTP 403 for account notification settings with null and invalid 'publicKey' parameter")
	@NullSource
	@CsvSource({"invalidPublicKey", "ed25519:5FwoV3MFB94ExfgycBvUQaTbTfgSMPAcfX62bgLBqEPR"})
	void getHttp403ForAccountNotificationSettingsWithNullAndInvalidPublicKeyParam(String publicKey) {
		String authToken = Base64Utils.encodeAuthToken(accountId, publicKey, accountSignature);
		List<String> types = List.of("ClubDao", "RemoveMemberFromRole", "FunctionCall", "Transfer", "ChangePolicy", "ChangeConfig");

		notificationsApiSteps.setNotificationSettings(
						authToken, "test-dao-1653656794681.sputnikv2.testnet", types, "0", false, false, false, false).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Account testdao2.testnet identity is invalid - public key"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for account notification settings with empty 'publicKey' parameter")
	@DisplayName("Get HTTP 403 for account notification settings with empty 'publicKey' parameter")
	void getHttp403ForAccountNotificationSettingsWithEmptyPublicKeyParam() {
		String authToken = Base64Utils.encodeAuthToken(accountId, EMPTY_STRING, accountSignature);
		List<String> types = List.of("ClubDao", "RemoveMemberFromRole", "FunctionCall", "Transfer", "ChangePolicy", "ChangeConfig");

		notificationsApiSteps.setNotificationSettings(
						authToken, "test-dao-1653656794681.sputnikv2.testnet", types, "0", false, false, false, false).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@ParameterizedTest
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for account notification settings with null and invalid 'accountId' parameter")
	@DisplayName("Get HTTP 403 for account notification settings with null and invalid 'accountId' parameter")
	@NullSource
	@CsvSource({"astro-automation.testnet", "another-magic.near", "test-dao-1641395769436.sputnikv2.testnet"})
	void getHttp403ForAccountNotificationSettingsWithNullAndInvalidAccountIdParam(String accountId) {
		String authToken = Base64Utils.encodeAuthToken(accountId, accountPublicKey, accountSignature);
		List<String> types = List.of("ClubDao", "RemoveMemberFromRole", "FunctionCall", "Transfer", "ChangePolicy", "ChangeConfig");
		String errorMessage = String.format("Account %s identity is invalid - public key", accountId);

		notificationsApiSteps.setNotificationSettings(
						authToken, "test-dao-1653656794681.sputnikv2.testnet", types, "0", false, false, false, false).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for account notification settings with empty 'accountId' parameter")
	@DisplayName("Get HTTP 403 for account notification settings with empty 'accountId' parameter")
	void getHttp403ForAccountNotificationSettingsWithEmptyAccountIdParam() {
		String authToken = Base64Utils.encodeAuthToken(EMPTY_STRING, accountPublicKey, accountSignature);
		List<String> types = List.of(
				"ClubDao", "RemoveMemberFromRole", "FunctionCall", "Transfer", "ChangePolicy", "ChangeConfig");

		notificationsApiSteps.setNotificationSettings(
						authToken, "test-dao-1653656794681.sputnikv2.testnet", types, "0", false, false, false, false).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for account notification settings with invalid 'signature' parameter")
	@DisplayName("Get HTTP 403 for account notification settings with invalid 'signature' parameter")
	void getHttp403ForAccountNotificationSettingsWithInvalidSignatureParam() {
		String invalidSignature = accountSignature.substring(10);
		String authToken = Base64Utils.encodeAuthToken(accountId, accountPublicKey, invalidSignature);
		List<String> types = List.of("ClubDao", "RemoveMemberFromRole", "FunctionCall", "Transfer", "ChangePolicy", "ChangeConfig");

		notificationsApiSteps.setNotificationSettings(
						authToken, "test-dao-1653656794681.sputnikv2.testnet", types, "0", false, false, false, false).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Invalid signature"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for account notification settings with null 'signature' parameter")
	@DisplayName("Get HTTP 403 for account notification settings with null 'signature' parameter")
	void getHttp403ForAccountNotificationSettingsWithNullSignatureParam() {
		String authToken = Base64Utils.encodeAuthToken(accountId, accountPublicKey, null);
		List<String> types = List.of("ClubDao", "RemoveMemberFromRole", "FunctionCall", "Transfer", "ChangePolicy", "ChangeConfig");

		notificationsApiSteps.setNotificationSettings(
						authToken, "test-dao-1653656794681.sputnikv2.testnet", types, "0", false, false, false, false).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Invalid signature"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for account notification settings with empty 'signature' parameter")
	@DisplayName("Get HTTP 403 for account notification settings with empty 'signature' parameter")
	void getHttp403ForAccountNotificationSettingsWithEmptySignatureParam() {
		String authToken = Base64Utils.encodeAuthToken(accountId, accountPublicKey, EMPTY_STRING);
		List<String> types = List.of("ClubDao", "RemoveMemberFromRole", "FunctionCall", "Transfer", "ChangePolicy", "ChangeConfig");

		notificationsApiSteps.setNotificationSettings(
						authToken, "test-dao-1653656794681.sputnikv2.testnet", types, "0", false, false, false, false).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to disable all account notification settings")
	@DisplayName("User should be able to disable all account notification settings")
	void disableAllAccountNotificationSettings() {
		AccountDAOs accountDaos = daoApiSteps.getAccountDaos(accountId).then()
				.statusCode(HTTP_OK)
				.extract().as(AccountDAOs.class);

		int accountRandomDao = faker.random().nextInt(0, accountDaos.size());
		String daoId = accountDaos.get(accountRandomDao).getId();

		AccountNotificationSettings accountNotificationSettings = notificationsApiSteps.setNotificationSettings(
				accountToken, daoId, Collections.emptyList(), "0", false, false, false, false).then()
				.statusCode(HTTP_CREATED)
				.extract().as(AccountNotificationSettings.class);

		String id = accountId + "-" + daoId;
		notificationsApiSteps.assertDtoValue(accountNotificationSettings, AccountNotificationSettings::getId, id, "id");
		notificationsApiSteps.assertDtoValue(accountNotificationSettings, AccountNotificationSettings::getAccountId, accountId, "accountId");
		notificationsApiSteps.assertDtoValue(accountNotificationSettings, AccountNotificationSettings::getDaoId, daoId, "daoId");
		notificationsApiSteps.assertCollectionHasCorrectSize(accountNotificationSettings.getTypes(), 0);
		notificationsApiSteps.assertDtoValue(accountNotificationSettings, AccountNotificationSettings::getMutedUntilTimestamp, "0", "mutedUntilTimestamp");
		notificationsApiSteps.assertDtoValue(accountNotificationSettings, AccountNotificationSettings::getIsAllMuted, false, "isAllMuted");
		notificationsApiSteps.assertDtoValue(accountNotificationSettings, AccountNotificationSettings::getEnableSms, false, "enableSms");
		notificationsApiSteps.assertDtoValue(accountNotificationSettings, AccountNotificationSettings::getEnableEmail, false, "enableEmail");
		notificationsApiSteps.assertDtoHasValue(accountNotificationSettings, AccountNotificationSettings::getUpdatedAt, "updatedAt");
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 400 for account notification settings with null 'mutedUntilTimestamp' param")
	@DisplayName("Get HTTP 400 for account notification settings with null 'mutedUntilTimestamp' param")
	void getHttp400ForAccountNotificationSettingsWithNullMutedUntilTimestampParam() {
		String daoId = "test-dao-1653994172816.sputnikv2.testnet";
		List<String> errorMessage = List.of(
				"mutedUntilTimestamp must be a string",
				"mutedUntilTimestamp must be a timestamp or empty");

		notificationsApiSteps.setNotificationSettings(accountToken, daoId, Collections.emptyList(), null, false, false, false, false).then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Bad Request"));
	}

	@ParameterizedTest
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 400 for account notification settings with invalid 'mutedUntilTimestamp' param")
	@DisplayName("Get HTTP 400 for account notification settings with invalid 'mutedUntilTimestamp' param")
	@CsvSource({"null", "test-dao-1641395769436.sputnikv2.testnet", "true", "false"})
	void getHttp400ForAccountNotificationSettingsWithInvalidMutedUntilTimestampParam(String mutedUntilTimestamp) {
		String daoId = "test-dao-1653994172816.sputnikv2.testnet";

		notificationsApiSteps.setNotificationSettings(
				accountToken, daoId, Collections.emptyList(), mutedUntilTimestamp, false, false, false, false).then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo(List.of("mutedUntilTimestamp must be a timestamp or empty")),
				      "error", equalTo("Bad Request"));
	}

	@ParameterizedTest
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 400 for account notification settings with null, empty and invalid 'types' param")
	@DisplayName("Get HTTP 400 for account notification settings with null, empty and invalid 'types' param")
	@EmptySource
	@CsvSource({"null", "test-dao-1641395769436.sputnikv2.testnet", "true", "false"})
	void getHttp400ForAccountNotificationSettingsWithNullEmptyAndInvalidTypesParam(String type) {
		String daoId = "test-dao-1653994172816.sputnikv2.testnet";

		notificationsApiSteps.setNotificationSettings(
						accountToken, daoId, List.of(type), EMPTY_STRING, false, false, false, false).then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo(List.of("each value in types must be a valid enum value")),
				      "error", equalTo("Bad Request"));
	}

	@ParameterizedTest
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 400 for account notification settings with invalid 'enableSms', 'enableEmail', 'isAllMuted', 'actionRequiredOnly' params")
	@DisplayName("Get HTTP 400 for account notification settings with invalid 'enableSms', 'enableEmail', 'isAllMuted', 'actionRequiredOnly' params")
	@CsvSource({"0, 0, 0, 0", "1, 1, 1, 1"})
	void getHttp400ForAccountNotificationSettingsWithInvalidBooleanParams(String enableSms, String enableEmail,
	                                                                             String isAllMuted, String actionRequiredOnly) {
		String body =
				"{\n" +
				"  \"daoId\": \"test-dao-1653994172816.sputnikv2.testnet\",\n" +
				"  \"types\": [],\n" +
				"  \"mutedUntilTimestamp\": \"\",\n" +
				"  \"enableSms\": " + enableSms + ",\n" +
				"  \"enableEmail\": " + enableEmail + ",\n" +
				"  \"isAllMuted\": " + isAllMuted + ",\n" +
				"  \"actionRequiredOnly\": " + actionRequiredOnly + "\n" +
				"}";

		notificationsApiSteps.setNotificationSettings(accountToken, body).then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo(List.of(
								"enableSms must be a boolean value",
								"enableEmail must be a boolean value",
								"isAllMuted must be a boolean value",
								"actionRequiredOnly must be a boolean value")),
				      "error", equalTo("Bad Request"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 400 for account notification settings with null 'enableSms', 'enableEmail', 'isAllMuted', 'actionRequiredOnly' params")
	@DisplayName("Get HTTP 400 for account notification settings with null 'enableSms', 'enableEmail', 'isAllMuted', 'actionRequiredOnly' params")
	void getHttp400ForAccountNotificationSettingsWithNullBooleanParams() {
		String body =
				"{\n" +
				"  \"daoId\": \"test-dao-1653994172816.sputnikv2.testnet\",\n" +
				"  \"types\": [],\n" +
				"  \"mutedUntilTimestamp\": \"\",\n" +
				"  \"enableSms\": " + null + ",\n" +
				"  \"enableEmail\": " + null + ",\n" +
				"  \"isAllMuted\": " + null + ",\n" +
				"  \"actionRequiredOnly\": " + null + "\n" +
				"}";

		notificationsApiSteps.setNotificationSettings(accountToken, body).then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo(List.of(
								"enableSms must be a boolean value",
								"enableEmail must be a boolean value",
								"isAllMuted must be a boolean value")),
				      "error", equalTo("Bad Request"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 400 for account notification settings with alphabetic 'enableSms', 'enableEmail', 'isAllMuted' boolean params")
	@DisplayName("Get HTTP 400 for account notification settings with alphabetic 'enableSms', 'enableEmail', 'isAllMuted' boolean params")
	void getHttp400ForAccountNotificationSettingsWithAlphabeticBooleanParams() {
		String body =
				"{\n" +
						"  \"daoId\": \"test-dao-1653994172816.sputnikv2.testnet\",\n" +
						"  \"types\": [],\n" +
						"  \"mutedUntilTimestamp\": \"\",\n" +
						"  \"enableSms\": " + "\"" + faker.rickAndMorty().location() + "\"" + ",\n" +
						"  \"enableEmail\": " + "\"" + faker.harryPotter().spell() + "\"" + ",\n" +
						"  \"isAllMuted\": " + "\"" + faker.chuckNorris().fact() + "\"" + ",\n" +
						"  \"actionRequiredOnly\": " + "\"" + faker.yoda().quote() + "\"" +
						"}";

		notificationsApiSteps.setNotificationSettings(accountToken, body).then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo(List.of(
								"enableSms must be a boolean value",
								"enableEmail must be a boolean value",
								"isAllMuted must be a boolean value",
								"actionRequiredOnly must be a boolean value")),
				      "error", equalTo("Bad Request"));
	}

	@ParameterizedTest
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 400 for account notification settings with null, empty and invalid 'daoId' param")
	@DisplayName("Get HTTP 400 for account notification settings with null, empty and invalid 'daoId' param")
	@CsvSource({"invalidAccountId", "2212332141", "-1", "0", "testdao3132498.testnet",
			"*", "autotest-dao-1.sputnikv2.testnet-1", "another-magic.near", "null"})
	void getHttp400ForAccountNotificationSettingsWithNullEmptyAndInvalidDaoIdParam(String daoId) {
		String errorMessage = "Invalid DAO id " + daoId;

		notificationsApiSteps.setNotificationSettings(
						accountToken, daoId, Collections.emptyList(), EMPTY_STRING, false, false, false, false).then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Bad Request"));
	}

}