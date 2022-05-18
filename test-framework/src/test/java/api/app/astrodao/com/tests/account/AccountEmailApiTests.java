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
import org.junit.jupiter.params.provider.NullSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;

import static java.net.HttpURLConnection.HTTP_BAD_REQUEST;
import static java.net.HttpURLConnection.HTTP_FORBIDDEN;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("accountEmailApiTests")})
@Epic("Account")
@Feature("/account/email API tests")
@DisplayName("/account/email API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class AccountEmailApiTests extends BaseTest {
	private final AccountApiSteps accountApiSteps;
	public final static String EMPTY_STRING = "";
	String email = "test-web-mail@invalidwebmail.com";

	@Value("${accounts.account3.accountId}")
	private String accountId;

	@Value("${accounts.account3.publicKey}")
	private String accountPublicKey;

	@Value("${accounts.account3.signature}")
	private String accountSignature;

	@Value("${accounts.account3.token}")
	private String accountToken;


	@ParameterizedTest
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for account email with null and invalid 'accountId' parameter")
	@DisplayName("Get HTTP 403 for account email with null and invalid 'accountId' parameter")
	@NullSource
	@CsvSource({"astro-automation.testnet", "another-magic.near", "test-dao-1641395769436.sputnikv2.testnet"})
	void getHttp403ForAccountEmailWithNullAndInvalidAccountIdParam(String accountId) {
		String authToken = Base64Utils.encodeAuthToken(accountId, accountPublicKey, accountSignature);
		String errorMessage = String.format("Account %s identity is invalid - public key", accountId);

		accountApiSteps.setAccountEmail(authToken, email)
				.then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Forbidden"));
	}

	@ParameterizedTest
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for account email with invalid 'publicKey' parameter")
	@DisplayName("Get HTTP 403 for account email with invalid 'publicKey' parameter")
	@NullSource
	@CsvSource({"invalidPublicKey"})
	void getHttp403ForAccountEmailWithInvalidPublicKeyParam(String publicKey) {
		String authToken = Base64Utils.encodeAuthToken(accountId, publicKey, accountSignature);

		accountApiSteps.setAccountEmail(authToken, email)
				.then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Account astro-automation-reserved6.testnet identity is invalid - public key"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for account email with invalid 'signature' parameter")
	@DisplayName("Get HTTP 403 for account email with invalid 'signature' parameter")
	void getHttp403ForAccountEmailWithInvalidSignatureParam() {
		String invalidSignature = accountSignature.substring(10);
		String authToken = Base64Utils.encodeAuthToken(accountId, accountPublicKey, invalidSignature);

		accountApiSteps.setAccountEmail(authToken, email)
				.then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Invalid signature"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for account email with null 'signature' parameter")
	@DisplayName("Get HTTP 403 for account email with null 'signature' parameter")
	void getHttp403ForAccountEmailWithNullSignatureParam() {
		String authToken = Base64Utils.encodeAuthToken(accountId, accountPublicKey, null);

		accountApiSteps.setAccountEmail(authToken, email)
				.then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Invalid signature"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 400 for account email with empty 'email' parameter")
	@DisplayName("Get HTTP 400 for account email with empty 'email' parameter")
	void getHttp400ForAccountEmailWithEmptyEmailParam() {
		List<String> errorMessage = List.of("email should not be empty", "email must be an email");

		accountApiSteps.setAccountEmail(accountToken, EMPTY_STRING)
				.then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Bad Request"));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 400 for account email with null 'email' parameter")
	@DisplayName("Get HTTP 400 for account email with null 'email' parameter")
	void getHttp400ForAccountEmailWithNullEmailParam() {
		List<String> errorMessage = List.of("email should not be empty", "email must be an email", "email must be a string");

		accountApiSteps.setAccountEmail(accountToken, null)
				.then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Bad Request"));
	}

	@ParameterizedTest
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 400 for account email with invalid 'email' parameter")
	@DisplayName("Get HTTP 400 for account email with invalid 'email' parameter")
	@CsvSource({"invalidEmail", "null"})
	void getHttp400ForAccountEmailWithInvalidEmailParam(String invalidEmail) {
		List<String> errorMessage = List.of("email must be an email");

		accountApiSteps.setAccountEmail(accountToken, invalidEmail)
				.then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Bad Request"));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for account email with empty 'accountId' parameter")
	@DisplayName("Get HTTP 403 for account email with empty 'accountId' parameter")
	void getHttp403ForAccountEmailWithEmptyAccountIdParam() {
		String authToken = Base64Utils.encodeAuthToken(EMPTY_STRING, accountPublicKey, accountSignature);

		accountApiSteps.setAccountEmail(authToken, email)
				.then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for account email with empty 'publicKey' parameter")
	@DisplayName("Get HTTP 403 for account email with empty 'publicKey' parameter")
	void getHttp403ForAccountEmailWithEmptyPublicKeyParam() {
		String authToken = Base64Utils.encodeAuthToken(accountId, EMPTY_STRING, accountSignature);

		accountApiSteps.setAccountEmail(authToken, email)
				.then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}
}
