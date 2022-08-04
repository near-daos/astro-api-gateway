package api.app.astrodao.com.core.controllers.apiservice;

import api.app.astrodao.com.openapi.models.AccountEmailDto;
import api.app.astrodao.com.openapi.models.AccountVerificationDto;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import static api.app.astrodao.com.core.Constants.ApiServiceEndpoints.*;
import static io.restassured.RestAssured.given;
import static io.restassured.http.ContentType.JSON;

@Component
@RequiredArgsConstructor
public class AccountApi {
	private final RequestSpecification requestSpecForApiService;

	public Response getAccountSettingsById(String accountId) {
		return given().spec(requestSpecForApiService)
				.accept(JSON)
				.get(ACCOUNT_ID, accountId);
	}

	public Response postAccountEmail(String authToken, String email) {
		AccountEmailDto accountEmailDto = new AccountEmailDto();
		accountEmailDto.setEmail(email);

		return given().spec(requestSpecForApiService)
				.accept(JSON)
				.header("Authorization", "Bearer " + authToken)
				.contentType(JSON)
				.body(accountEmailDto)
				.post(ACCOUNT_EMAIL);
	}

	public Response postSendEmailVerificationCode(String authToken) {
		return given().spec(requestSpecForApiService)
				.accept(JSON)
				.header("Authorization", "Bearer " + authToken)
				.contentType(JSON)
				.post(ACCOUNT_EMAIL_SEND_VERIFICATION);
	}

	public Response postVerifyEmail(String authToken, String code) {
		AccountVerificationDto accountVerificationDto = new AccountVerificationDto();
		accountVerificationDto.setCode(code);

		return given().spec(requestSpecForApiService)
				.accept(JSON)
				.header("Authorization", "Bearer " + authToken)
				.contentType(JSON)
				.body(accountVerificationDto)
				.post(ACCOUNT_EMAIL_VERIFY);
	}

	public Response getAccountPhoneVerificationStatus(String accountId) {
		return given().spec(requestSpecForApiService)
				.accept(JSON)
				.get(ACCOUNT_ACCOUNT_ID_PHONE_VERIFICATION_STATUS, accountId);
	}

	public Response getAccountEmailVerificationStatus(String accountId) {
		return given().spec(requestSpecForApiService)
				.accept(JSON)
				.get(ACCOUNT_ACCOUNT_ID_EMAIL_VERIFICATION_STATUS, accountId);
	}
}
