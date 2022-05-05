package api.app.astrodao.com.steps.util;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.controllers.utilcontrollers.DisposableEmail;
import io.qameta.allure.Step;
import lombok.RequiredArgsConstructor;

@Steps
@RequiredArgsConstructor
public class DisposableEmailApiSteps {
	private final DisposableEmail disposableEmail;

	@Step("Getting disposable random email")
	public String getEmail() {
		return disposableEmail.getEmail();
	}
}

