package api.app.astrodao.com.steps.util;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.controllers.utilcontrollers.DisposableEmail;
import io.qameta.allure.Description;
import io.qameta.allure.Step;
import io.restassured.response.ValidatableResponse;
import lombok.RequiredArgsConstructor;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

import static org.awaitility.Awaitility.await;

@Steps
@RequiredArgsConstructor
public class DisposableEmailApiSteps {
	private final DisposableEmail disposableEmail;

	@Step("Getting disposable random email")
	public String getEmail() {
		return disposableEmail.getEmail();
	}

	@Step("Checking that the mailbox '{login}@{domain}' has an email")
	private ValidatableResponse getMessages(String login, String domain) {
		return disposableEmail.getMessages(login, domain);
	}

	@Step("Polling a mailbox for an email ID. Delay 10s. Polling interval 10s. Timeout 1 min.")
	public String pollingMailBoxAndGetEmailId(String login, String domain) {

		AtomicReference<ValidatableResponse> response = new AtomicReference<>();
		await()
				.timeout(1, TimeUnit.MINUTES)
				.alias("Failed due to timeout 1 min. No verification email is received.")
				.pollDelay(10, TimeUnit.SECONDS)
				.pollInterval(10, TimeUnit.SECONDS)
				.untilAsserted(() -> {
					response.set(this.getMessages(login, domain));
				});
		return response.get().extract().body().jsonPath().getList("id").get(0).toString();
	}

	@Step("Open email address '{login}@{domain}' with ID {emailId} and get verification code")
	public String getEmailVerificationCode(String login, String domain, String emailId) {
		ValidatableResponse response = disposableEmail.readMessage(login, domain, emailId);
		String verificationCode = response.extract().jsonPath().getString("body");
		return verificationCode.substring(31, 37);
	}
}

