package api.app.astrodao.com.core.controllers.utilcontrollers;

import io.restassured.response.ValidatableResponse;
import io.restassured.specification.RequestSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import static api.app.astrodao.com.core.Constants.DisposableEmailParams.*;
import static io.restassured.RestAssured.given;
import static io.restassured.http.ContentType.JSON;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.hamcrest.Matchers.*;

@Component
@RequiredArgsConstructor
public class DisposableEmail {
	private final RequestSpecification requestSpecForDisposableWebMail;

	public String getEmail() {
		return given().spec(requestSpecForDisposableWebMail)
				.queryParam(ACTION_PARAM, GET_RANDOM_MAILBOX)
				.get()
				.then()
				.statusCode(HTTP_OK)
				.contentType(JSON)
				.body("", hasSize(1))
				.extract()
				.body().jsonPath().getList("").get(0).toString();
	}


	public ValidatableResponse getMessages(String login, String domain) {
		return given()
				.spec(requestSpecForDisposableWebMail)
				.queryParam(ACTION_PARAM, GET_MESSAGES)
				.queryParam("login", login)
				.queryParam("domain", domain)
				.get()
				.then()
				.statusCode(HTTP_OK)
				.body(not(equalTo("[]")));
	}

	public ValidatableResponse readMessage(String login, String domain, String emailId) {
		return given()
				.spec(requestSpecForDisposableWebMail)
				.queryParam(ACTION_PARAM, READ_MESSAGE)
				.queryParam("login", login)
				.queryParam("domain", domain)
				.queryParam("id", emailId)
				.get()
				.then()
				.statusCode(HTTP_OK)
				.body(
						"id", equalTo(Integer.parseInt(emailId)),
						"subject", equalTo("Email Verification for AstroDAO"
						));
	}
}
