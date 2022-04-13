package api.app.astrodao.com.core.controllers;

import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

import static api.app.astrodao.com.core.Constants.Endpoints.NOTIFICATIONS;
import static api.app.astrodao.com.core.Constants.Endpoints.NOTIFICATIONS_ID;
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
}
