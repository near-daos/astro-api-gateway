package api.app.astrodao.com.steps;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.controllers.NotificationsApi;
import io.qameta.allure.Step;
import io.restassured.response.Response;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;

@Steps
@RequiredArgsConstructor
public class NotificationsApiSteps extends BaseSteps {
    private final NotificationsApi notificationsApi;

    @Step("Getting notifications with '{queryParams}' query params")
    public Response getNotifications(Map<String, Object> queryParams) {
        return notificationsApi.getNotifications(queryParams);
    }

    @Step("Getting notification by notification ID '{notificationId}' query param")
    public Response getNotificationById(String notificationId) {
        return notificationsApi.getNotificationById(notificationId);
    }

    @Step("Getting notifications-settings with '{queryParams}' query params")
    public Response getNotificationsSettings(Map<String, Object> queryParams) {
        return notificationsApi.getNotificationsSettings(queryParams);
    }

    @Step("Getting account notification status by '{accountId}' query param")
	public Response getAccountNotificationStatus(String accountId) {
        return notificationsApi.getAccountNotificationStatus(accountId);
	}

    @Step("Set notification settings for DAO '{daoId}'")
    public Response setNotificationSettings(String authToken, String daoId, List<String> types, String mutedUntilTimestamp,
                                            boolean isEnableSms, boolean isEnableEmail, boolean isAllMuted) {
        return notificationsApi.setNotificationSettings(authToken, daoId, types, mutedUntilTimestamp, isEnableSms, isEnableEmail, isAllMuted);
    }

    @Step("Set notification settings for DAO")
    public Response setNotificationSettings(String authToken, String body) {
        return notificationsApi.setNotificationSettings(authToken, body);
    }
}
