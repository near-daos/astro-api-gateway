package api.app.astrodao.com.tests.account;

import api.app.astrodao.com.steps.AccountApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import com.github.javafaker.Faker;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import static java.net.HttpURLConnection.HTTP_BAD_REQUEST;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("accountEmailVerifyApiTests")})
@Epic("Account")
@Feature("/account/email/verify API tests")
@DisplayName("/account/email/verify API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class AccountEmailVerifyApiTests extends BaseTest {
	private final AccountApiSteps accountApiSteps;
	private final Faker faker;

	@Value("${accounts.account1.token}")
	private String account1token;

	@Value("${accounts.account4.token}")
	private String account4token;


	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 400 for account email verify with no account email")
	@DisplayName("Get HTTP 400 for account email verify with no account email")
	void getHttp400ForAccountEmailVerifyForNoAccountEmail() {
		String code = String.valueOf(faker.number().randomNumber(6, false));

		accountApiSteps.verifyEmail(account1token, code).then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo("No email found for account: testdao2.testnet"),
				      "error", equalTo("Bad Request"));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 400 for account email verify with invalid numeric verification code")
	@DisplayName("Get HTTP 400 for account email verify with invalid numeric verification code")
	void getHttp400ForAccountEmailVerifyWithInvalidNumericVerificationCode() {
		String code = String.valueOf(faker.number().randomNumber(6, false));
		String errorMessage = String.format("Invalid verification code: %s", code);

		accountApiSteps.verifyEmail(account4token, code).then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Bad Request"));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 400 for account email verify with invalid alphabetic verification code")
	@DisplayName("Get HTTP 400 for account email verify with invalid alphabetic verification code")
	void getHttp400ForAccountEmailVerifyWithInvalidAlphabeticVerificationCode() {
		String code = String.valueOf(faker.lorem().fixedString(10));
		String errorMessage = String.format("Invalid verification code: %s", code);

		accountApiSteps.verifyEmail(account4token, code).then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Bad Request"));
	}

}
