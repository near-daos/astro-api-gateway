package api.app.astrodao.com.core.controllers;

import api.app.astrodao.com.openapi.models.CreateAccountNotificationSettingsDto;
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
    private final RequestSpecification requestSpec;

    public Response getNotifications(Map<String, Object> queryParams) {
        return given().spec(requestSpec)
                .queryParams(queryParams)
                .accept(ContentType.JSON)
                .get(NOTIFICATIONS);
    }

	public Response getNotificationById(String notificationId) {
		return given().spec(requestSpec)
				.accept(ContentType.JSON)
				.get(NOTIFICATIONS_ID, notificationId);
	}

	public Response getNotificationsSettings(Map<String, Object> queryParams) {
		return given().spec(requestSpec)
				.queryParams(queryParams)
				.accept(ContentType.JSON)
				.get(NOTIFICATIONS_SETTINGS);
	}

	public Response getAccountNotificationStatus(String accountId) {
		return given().spec(requestSpec)
				.accept(ContentType.JSON)
				.get(ACCOUNT_NOTIFICATION_STATUS_ACCOUNT_ID, accountId);
	}

	public Response setNotificationSettings(String authToken, String daoId, List<String> types, String mutedUntilTimestamp,
	                                        boolean isEnableSms, boolean isEnableEmail, boolean isAllMuted) {
		CreateAccountNotificationSettingsDto createAccountNotificationSettings = new CreateAccountNotificationSettingsDto();
		createAccountNotificationSettings.setDaoId(daoId);
		createAccountNotificationSettings.setTypes(types);
		createAccountNotificationSettings.setMutedUntilTimestamp(mutedUntilTimestamp);
		createAccountNotificationSettings.setEnableSms(isEnableSms);
		createAccountNotificationSettings.setEnableEmail(isEnableEmail);
		createAccountNotificationSettings.isAllMuted(isAllMuted);

		return given().spec(requestSpec)
				.accept(ContentType.JSON)
				.header("Authorization", "Bearer " + authToken)
				.contentType(ContentType.JSON)
				.body(createAccountNotificationSettings)
				.post(NOTIFICATIONS_SETTINGS);
	}
}
