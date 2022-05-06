package api.app.astrodao.com.tests.notifications;

import api.app.astrodao.com.openapi.models.Dao;
import api.app.astrodao.com.openapi.models.Notification;
import api.app.astrodao.com.openapi.models.Policy;
import api.app.astrodao.com.steps.NotificationsApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;

import static java.net.HttpURLConnection.HTTP_BAD_REQUEST;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("notificationsIdApiTests")})
@Epic("Notifications")
@Feature("/notifications/{id} API tests")
@DisplayName("/notifications/{id} API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class NotificationsIdApiTests extends BaseTest {
	private final NotificationsApiSteps notificationsApiSteps;

	@Value("${test.accountId}")
	private String testAccountId;

	@Value("${test.dao1}")
	private String daoId;

	@ParameterizedTest
	@Severity(SeverityLevel.CRITICAL)
	@Story("Getting notification details by notification ID param")
	@DisplayName("Getting notification details by notification ID param")
	@CsvSource({"2ryss6nt1jksasawt3dgojwh7esm9ngnlnlydm47hvam-vote, test-dao-1641395769436.sputnikv2.testnet-3677, Vote, VoteRemove",
			"2mqh9t9xkz2j5g1frpeudlwvchn94wjxylrscutuaqaj-changeconfig, test-dao-1641395769436.sputnikv2.testnet-3182, ChangeConfig, Created",
			"ftugpyqo44q7m2zyepchzmvbp4x1rsm6ghqpeuyabcua-changepolicy, test-dao-1641395769436.sputnikv2.testnet-3183, ChangePolicy, Created",
			"cpt7ra6a3qeqypjr3bawk3vmho4pwoqqzfksca6rdye7-transfer, test-dao-1641395769436.sputnikv2.testnet-3180, Transfer, Created",
			"brky1bgbrv9erjfumjjysg5f4rqtx7trvfg1ldtmtg6a-addbounty, test-dao-1641395769436.sputnikv2.testnet-3185, AddBounty, Created"})
	void getNotificationDetailsByNotificationId(String notificationId, String targetId, String type, String status) {
		Notification notifications = notificationsApiSteps.getNotificationById(notificationId).then()
				.statusCode(HTTP_OK)
				.extract().as(Notification.class);

		notificationsApiSteps.assertDtoValue(notifications, Notification::getId, notificationId, "id");
		notificationsApiSteps.assertDtoValue(notifications, Notification::getDaoId, daoId, "daoId");
		notificationsApiSteps.assertDtoValue(notifications, Notification::getTargetId, targetId, "targetId");
		notificationsApiSteps.assertDtoValue(notifications, Notification::getSignerId, testAccountId, "signer");
		notificationsApiSteps.assertDtoValue(notifications, notification1 -> notification1.getType().getValue(), type, "type");
		notificationsApiSteps.assertDtoValue(notifications, notification1 -> notification1.getStatus().getValue(), status, "status");
		notificationsApiSteps.assertDtoHasValue(notifications, notification -> notification.getMetadata() != null, "notification/metadata");
		notificationsApiSteps.assertDtoHasValue(notifications.getDao(), dao -> dao.getMetadata() != null, "dao/metadata");
		notificationsApiSteps.assertDtoHasValue(notifications.getDao(), dao -> dao.getPolicy().getRoles() != null, "dao/policy/roles");
		notificationsApiSteps.assertDtoValue(notifications.getDao(), Dao::getId, daoId, "dao/id");
		notificationsApiSteps.assertCollectionsAreEqual(notifications.getDao().getAccountIds(), List.of(testAccountId));
		notificationsApiSteps.assertDtoValue(notifications.getDao().getPolicy(), Policy::getDaoId, daoId, "dao/policy/id");
		notificationsApiSteps.assertDtoValue(notifications.getDao(), Dao::getCreatedBy, testAccountId, "dao/createdBy");
	}

	@ParameterizedTest
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 400 for Notification ID")
	@DisplayName("Get HTTP 400 for Notification ID")
	@CsvSource({"invalidId", "2212332141", "-1", "0",
			"*", "null", "autotest-dao-1.sputnikv2.testnet-1", "another-magic.near",
			"test-dao-1641395769436.sputnikv2.testnet-3184", "test-dao-1641395769436.sputnikv2.testnet", "testdao2.testnet"})
	void getHttp400ForNotificationId(String notificationId) {
		notificationsApiSteps.getNotificationById(notificationId).then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo("Invalid Notification ID"),
				      "error", equalTo("Bad Request"));
	}
}