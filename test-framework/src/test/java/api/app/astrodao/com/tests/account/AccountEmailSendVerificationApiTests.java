package api.app.astrodao.com.tests.account;

import api.app.astrodao.com.steps.AccountApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import static java.net.HttpURLConnection.HTTP_FORBIDDEN;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("accountEmailSendVerificationApiTests")})
@Epic("Account")
@Feature("/account/email/send-verification API tests")
@DisplayName("/account/email/send-verification API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class AccountEmailSendVerificationApiTests extends BaseTest {
	private final AccountApiSteps accountApiSteps;

	@Value("${accounts.account3.accountId}")
	private String accountId;

	@Value("${accounts.account3.publicKey}")
	private String accountPublicKey;

	@Value("${accounts.account3.signature}")
	private String accountSignature;

	@ParameterizedTest
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for account email verification with invalid 'publicKey' parameter")
	@DisplayName("Get HTTP 403 for account email verification with invalid 'publicKey' parameter")
	@NullAndEmptySource
	@CsvSource({"invalidPublicKey"})
	void getHttp403ForAccountEmailVerificationWithInvalidPublicKeyParam(String publicKey) {
		accountApiSteps.sendEmailVerificationCode(accountId, publicKey, accountSignature)
				.then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Account astro-automation-reserved6.testnet identity is invalid - public key"),
				      "error", equalTo("Forbidden"));
	}

	@ParameterizedTest
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for account email verification with invalid 'accountId' parameter")
	@DisplayName("Get HTTP 403 for account email verification with invalid 'accountId' parameter")
	@CsvSource({"astro-automation.testnet", "another-magic.near", "test-dao-1641395769436.sputnikv2.testnet"})
	void getHttp403ForAccountEmailVerificationWithInvalidAccountIdParam(String accountId) {
		String errorMessage = String.format("Account %s identity is invalid - public key", accountId);

		accountApiSteps.sendEmailVerificationCode(accountId, accountPublicKey, accountSignature)
				.then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for account email verification with invalid 'signature' parameter")
	@DisplayName("Get HTTP 403 for account email verification with invalid 'signature' parameter")
	void getHttp403ForAccountEmailVerificationWithInvalidSignatureParam() {
		String invalidSignature = accountSignature.substring(7);
		accountApiSteps.sendEmailVerificationCode(accountId, accountPublicKey, invalidSignature)
				.then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Invalid signature"),
				      "error", equalTo("Forbidden"));
	}

	@ParameterizedTest
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for account email verification with null and empty 'accountId' parameter")
	@DisplayName("Get HTTP 403 for account email verification with null and empty 'accountId' parameter")
	@NullAndEmptySource
	void getHttp403ForAccountEmailVerificationWithNullAndEmptyAccountIdParam(String accountId) {
		accountApiSteps.sendEmailVerificationCode(accountId, accountPublicKey, accountSignature)
				.then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header is invalid"),
				      "error", equalTo("Forbidden"));
	}
}