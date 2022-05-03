package api.app.astrodao.com.core.controllers;

import api.app.astrodao.com.openapi.models.AccountEmailDto;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import static api.app.astrodao.com.core.Constants.Endpoints.ACCOUNT_EMAIL;
import static api.app.astrodao.com.core.Constants.Endpoints.ACCOUNT_ID;
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
}
