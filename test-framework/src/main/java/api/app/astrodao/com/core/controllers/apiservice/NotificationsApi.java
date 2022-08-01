package api.app.astrodao.com.core.controllers.apiservice;

import api.app.astrodao.com.core.utils.JsonUtils;
import api.app.astrodao.com.openapi.models.CreateAccountNotificationSettingsDto;
import api.app.astrodao.com.openapi.models.UpdateAccountNotificationDto;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

import static api.app.astrodao.com.core.Constants.Endpoints.*;
import static io.restassured.RestAssured.given;

@Component
@RequiredArgsConstructor
public class NotificationsApi {
    private final RequestSpecification requestSpecForApiService;

    public Response getNotifications(Map<String, Object> queryParams) {
        return given().spec(requestSpecForApiService)
                .queryParams(queryParams)
                .accept(ContentType.JSON)
                .get(NOTIFICATIONS);
    }

	public Response getNotificationById(String notificationId) {
		return given().spec(requestSpecForApiService)
				.accept(ContentType.JSON)
				.get(NOTIFICATIONS_ID, notificationId);
	}

	public Response getNotificationsSettings(Map<String, Object> queryParams) {
		return given().spec(requestSpecForApiService)
				.queryParams(queryParams)
				.accept(ContentType.JSON)
				.get(NOTIFICATIONS_SETTINGS);
	}

	public Response getAccountNotificationStatus(String accountId) {
		return given().spec(requestSpecForApiService)
				.accept(ContentType.JSON)
				.get(ACCOUNT_NOTIFICATION_STATUS_ACCOUNT_ID, accountId);
	}

	public Response postNotificationSettings(String authToken, String daoId, List<String> types, String mutedUntilTimestamp,
	                                         boolean isEnableSms, boolean isEnableEmail, boolean isAllMuted) {
		CreateAccountNotificationSettingsDto createAccountNotificationSettings = new CreateAccountNotificationSettingsDto();
		createAccountNotificationSettings.setDaoId(daoId);
		createAccountNotificationSettings.setTypes(types);
		createAccountNotificationSettings.setMutedUntilTimestamp(mutedUntilTimestamp);
		createAccountNotificationSettings.setEnableSms(isEnableSms);
		createAccountNotificationSettings.setEnableEmail(isEnableEmail);
		createAccountNotificationSettings.isAllMuted(isAllMuted);

		return given().spec(requestSpecForApiService)
				.accept(ContentType.JSON)
				.header("Authorization", "Bearer " + authToken)
				.contentType(ContentType.JSON)
				.body(createAccountNotificationSettings)
				.post(NOTIFICATIONS_SETTINGS);
	}

	public Response postNotificationSettings(String authToken, String body) {
		return given().spec(requestSpecForApiService)
				.accept(ContentType.JSON)
				.header("Authorization", "Bearer " + authToken)
				.contentType(ContentType.JSON)
				.body(body)
				.post(NOTIFICATIONS_SETTINGS);
	}

	public Response patchReadAllAccountNotifications(String authToken) {
		return given().spec(requestSpecForApiService)
				.accept(ContentType.JSON)
				.header("Authorization", "Bearer " + authToken)
				.contentType(ContentType.JSON)
				.patch(ACCOUNT_NOTIFICATIONS_READ_ALL);
	}

	public Response patchAccountNotificationsById(String authToken, String notificationId,
	                                              boolean isMuted, boolean isRead, boolean isArchived) {
		UpdateAccountNotificationDto updateAccountNotificationDto = new UpdateAccountNotificationDto();
		updateAccountNotificationDto.setIsMuted(isMuted);
		updateAccountNotificationDto.setIsRead(isRead);
		updateAccountNotificationDto.setIsArchived(isArchived);

		return given().spec(requestSpecForApiService)
				.accept(ContentType.JSON)
				.header("Authorization", "Bearer " + authToken)
				.contentType(ContentType.JSON)
				.body(JsonUtils.writeValueAsString(updateAccountNotificationDto))
				.patch(ACCOUNT_NOTIFICATIONS_ID, notificationId);
	}

	public Response getAccountNotifications(Map<String, Object> queryParams) {
		return given().spec(requestSpecForApiService)
				.queryParams(queryParams)
				.accept(ContentType.JSON)
				.get(ACCOUNT_NOTIFICATIONS);
	}
}
