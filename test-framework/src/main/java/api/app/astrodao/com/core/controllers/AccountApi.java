package api.app.astrodao.com.core.controllers;

import api.app.astrodao.com.openapi.models.AccountBearer;
import api.app.astrodao.com.openapi.models.AccountEmailDto;
import api.app.astrodao.com.openapi.models.AccountVerificationDto;
import api.app.astrodao.com.openapi.models.VerificationStatus;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import static api.app.astrodao.com.core.Constants.Endpoints.*;
import static io.restassured.RestAssured.given;
import static io.restassured.http.ContentType.JSON;

@Component
@RequiredArgsConstructor
public class AccountApi {
	private final RequestSpecification requestSpec;

	public Response getAccountSettingsById(String accountId) {
		return given().spec(requestSpec)
				.accept(JSON)
				.get(ACCOUNT_ID, accountId);
	}

	public Response postAccountEmail(String accountId, String publicKey, String signature, String email) {
		AccountEmailDto accountEmailDto = new AccountEmailDto();
		accountEmailDto.setAccountId(accountId);
		accountEmailDto.setPublicKey(publicKey);
		accountEmailDto.setSignature(signature);
		accountEmailDto.setEmail(email);

		return given().spec(requestSpec)
				.accept(JSON)
				.contentType(JSON)
				.body(accountEmailDto)
				.post(ACCOUNT_EMAIL);
	}

	public Response postSendEmailVerificationCode(String accountId, String publicKey, String signature) {
		AccountBearer accountBearer = new AccountBearer();
		accountBearer.setAccountId(accountId);
		accountBearer.setPublicKey(publicKey);
		accountBearer.setSignature(signature);

		return given().spec(requestSpec)
				.accept(JSON)
				.contentType(JSON)
				.body(accountBearer)
				.post(ACCOUNT_EMAIL_SEND_VERIFICATION);
	}

	public Response postVerifyEmail(String accountId, String publicKey, String signature, String code) {
		AccountVerificationDto accountVerificationDto = new AccountVerificationDto();
		accountVerificationDto.setAccountId(accountId);
		accountVerificationDto.setPublicKey(publicKey);
		accountVerificationDto.setSignature(signature);
		accountVerificationDto.setCode(code);

		return given().spec(requestSpec)
				.accept(JSON)
				.contentType(JSON)
				.body(accountVerificationDto)
				.post(ACCOUNT_EMAIL_VERIFY);
	}
}
