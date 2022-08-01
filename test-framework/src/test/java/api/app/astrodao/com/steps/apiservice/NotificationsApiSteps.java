package api.app.astrodao.com.steps.apiservice;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.controllers.apiservice.NotificationsApi;
import api.app.astrodao.com.steps.BaseSteps;
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
        return notificationsApi.postNotificationSettings(authToken, daoId, types, mutedUntilTimestamp, isEnableSms, isEnableEmail, isAllMuted);
    }

    @Step("Set notification settings for DAO")
    public Response setNotificationSettings(String authToken, String body) {
        return notificationsApi.postNotificationSettings(authToken, body);
    }

    @Step("Read All account notification settings")
    public Response patchReadAllAccountNotifications(String authToken) {
        return notificationsApi.patchReadAllAccountNotifications(authToken);
    }

    @Step("Patch account notifications by 'notificationId' param")
    public Response patchAccountNotificationsById(String authToken, String notificationId, boolean isMuted, boolean isRead, boolean isArchived) {
        return notificationsApi.patchAccountNotificationsById(authToken, notificationId, isMuted, isRead, isArchived);
    }

    @Step("Getting account notifications with query params '{queryParams}'")
    public Response getAccountNotifications(Map<String, Object> queryParams) {
        return notificationsApi.getAccountNotifications(queryParams);
    }
}
