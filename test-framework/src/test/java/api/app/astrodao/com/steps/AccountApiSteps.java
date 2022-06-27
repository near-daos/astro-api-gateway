package api.app.astrodao.com.steps;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.controllers.AccountApi;
import io.qameta.allure.Step;
import io.restassured.response.Response;
import lombok.RequiredArgsConstructor;

@Steps
@RequiredArgsConstructor
public class AccountApiSteps extends BaseSteps {
	private final AccountApi accountApi;

	@Step("Getting account settings by '{accountId}' query param")
	public Response getAccountSettingsById(String accountId) {
		return accountApi.getAccountSettingsById(accountId);
	}

	@Step("Set account email '{email}'")
	public Response setAccountEmail(String authToken, String email) {
		return accountApi.postAccountEmail(authToken, email);
	}

	@Step("Send account email verification code")
	public Response sendEmailVerificationCode(String authToken) {
		return accountApi.postSendEmailVerificationCode(authToken);
	}

	@Step("Verify email")
	public Response verifyEmail(String authToken, String code) {
		return accountApi.postVerifyEmail(authToken, code);
	}

	@Step("Getting account phone verification status by '{accountId}' query param")
	public Response getAccountPhoneVerificationStatus(String accountId) {
		return accountApi.getAccountPhoneVerificationStatus(accountId);
	}
}
