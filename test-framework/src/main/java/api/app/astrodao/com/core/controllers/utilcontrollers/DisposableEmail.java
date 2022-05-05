package api.app.astrodao.com.core.controllers.utilcontrollers;

import io.restassured.specification.RequestSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import static api.app.astrodao.com.core.Constants.DisposableEmailParams.GET_RANDOM_MAILBOX;
import static io.restassured.RestAssured.given;
import static io.restassured.http.ContentType.JSON;
import static java.net.HttpURLConnection.HTTP_OK;

@Component
@RequiredArgsConstructor
public class DisposableEmail {
	private final RequestSpecification requestSpecForDisposableWebMail;

	public String getEmail() {
		return given().spec(requestSpecForDisposableWebMail)
				.get(GET_RANDOM_MAILBOX)
				.then()
				.statusCode(HTTP_OK)
				.contentType(JSON)
				.extract()
				.body().jsonPath().getList("").get(0).toString();
	}
}
