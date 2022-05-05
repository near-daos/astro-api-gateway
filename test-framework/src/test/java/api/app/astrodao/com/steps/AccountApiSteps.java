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
	public Response postAccountEmail(String accountId, String publicKey, String signature, String email) {
		return accountApi.postAccountEmail(accountId, publicKey, signature, email);
	}
}
