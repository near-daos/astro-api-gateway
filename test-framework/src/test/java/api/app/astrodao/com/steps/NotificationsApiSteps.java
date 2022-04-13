package api.app.astrodao.com.steps;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.controllers.NotificationsApi;
import io.qameta.allure.Step;
import io.restassured.response.Response;
import lombok.RequiredArgsConstructor;

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
}
