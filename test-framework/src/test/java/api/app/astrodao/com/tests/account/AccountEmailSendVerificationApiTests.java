package api.app.astrodao.com.tests.account;

import api.app.astrodao.com.core.utils.Base64Utils;
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
import org.junit.jupiter.params.provider.NullSource;
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
	public final static String EMPTY_STRING = "";

	@Value("${accounts.account3.accountId}")
	private String accountId;

	@Value("${accounts.account3.publicKey}")
	private String accountPublicKey;

	@Value("${accounts.account3.signature}")
	private String accountSignature;

	@ParameterizedTest
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for account email verification with null and invalid 'publicKey' parameter")
	@DisplayName("Get HTTP 403 for account email verification with null and invalid 'publicKey' parameter")
	@NullSource
	@CsvSource({"invalidPublicKey"})
	void getHttp403ForAccountEmailVerificationWithNullAndInvalidPublicKeyParam(String publicKey) {
		String authToken = Base64Utils.encodeAuthToken(accountId, publicKey, accountSignature);

		accountApiSteps.sendEmailVerificationCode(authToken)
				.then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Account astro-automation-reserved6.testnet identity is invalid - public key"),
				      "error", equalTo("Forbidden"));
	}

	@ParameterizedTest
	@NullSource
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for account email verification with null and invalid 'accountId' parameter")
	@DisplayName("Get HTTP 403 for account email verification with null and invalid 'accountId' parameter")
	@CsvSource({"astro-automation.testnet", "another-magic.near", "test-dao-1641395769436.sputnikv2.testnet"})
	void getHttp403ForAccountEmailVerificationWithNullAndInvalidAccountIdParam(String accountId) {
		String authToken = Base64Utils.encodeAuthToken(accountId, accountPublicKey, accountSignature);
		String errorMessage = String.format("Account %s identity is invalid - public key", accountId);

		accountApiSteps.sendEmailVerificationCode(authToken)
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
		String authToken = Base64Utils.encodeAuthToken(accountId, accountPublicKey, invalidSignature);
		accountApiSteps.sendEmailVerificationCode(authToken)
				.then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Invalid signature"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for account email verification with empty 'accountId' parameter")
	@DisplayName("Get HTTP 403 for account email verification with empty 'accountId' parameter")
	void getHttp403ForAccountEmailVerificationWithEmptyAccountIdParam() {
		String authToken = Base64Utils.encodeAuthToken(EMPTY_STRING, accountPublicKey, accountSignature);
		accountApiSteps.sendEmailVerificationCode(authToken)
				.then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@ParameterizedTest
	@NullAndEmptySource
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for account email verification with null and empty 'signature' parameter")
	@DisplayName("Get HTTP 403 for account email verification with null and empty 'signature' parameter")
	void getHttp403ForAccountEmailVerificationWithNullAndEmptySignatureParam(String signature) {
		String authToken = Base64Utils.encodeAuthToken(EMPTY_STRING, accountPublicKey, signature);

		accountApiSteps.sendEmailVerificationCode(authToken)
				.then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for account email verification with empty 'publicKey' parameter")
	@DisplayName("Get HTTP 403 for account email verification with empty 'publicKey' parameter")
	void getHttp403ForAccountEmailVerificationWithEmptyPublicKeyParam() {
		String authToken = Base64Utils.encodeAuthToken(accountId, EMPTY_STRING, accountSignature);

		accountApiSteps.sendEmailVerificationCode(authToken)
				.then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}
}