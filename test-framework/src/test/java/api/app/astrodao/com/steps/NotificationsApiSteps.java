package api.app.astrodao.com.steps;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.controllers.NotificationsApi;
import io.qameta.allure.Step;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@Steps
@RequiredArgsConstructor
public class NotificationsApiSteps extends BaseSteps {
    private final NotificationsApi notificationsApi;

    @Step("Getting notifications with '{queryParams}' query params")
    public ResponseEntity<String> getNotifications(Map<String, Object> queryParams) {
        return notificationsApi.getNotifications(queryParams);
    }
}
