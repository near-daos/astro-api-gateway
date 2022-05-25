package api.app.astrodao.com.tests.account;

import api.app.astrodao.com.core.utils.Base64Utils;
import api.app.astrodao.com.steps.AccountApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import com.github.javafaker.Faker;
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

import static java.net.HttpURLConnection.HTTP_BAD_REQUEST;
import static java.net.HttpURLConnection.HTTP_FORBIDDEN;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("accountEmailVerifyApiTests")})
@Epic("Account")
@Feature("/account/email/verify API tests")
@DisplayName("/account/email/verify API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class AccountEmailVerifyApiTests extends BaseTest {
	private final AccountApiSteps accountApiSteps;
	private final Faker faker;
	public final static String EMPTY_STRING = "";

	@Value("${accounts.account1.token}")
	private String account1token;

	@Value("${accounts.account3.accountId}")
	private String account3Id;

	@Value("${accounts.account3.publicKey}")
	private String account3PublicKey;

	@Value("${accounts.account3.signature}")
	private String account3Signature;

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

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 400 for account email verify with invalid alphanumeric verification code")
	@DisplayName("Get HTTP 400 for account email verify with invalid alphanumeric verification code")
	void getHttp400ForAccountEmailVerifyWithInvalidAlphanumericVerificationCode() {
		String code = String.valueOf(faker.lorem().characters(7));
		String errorMessage = String.format("Invalid verification code: %s", code);

		accountApiSteps.verifyEmail(account4token, code).then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Bad Request"));
	}

	@ParameterizedTest
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for account email verify with null and invalid 'publicKey' parameter")
	@DisplayName("Get HTTP 403 for account email verify with null and invalid 'publicKey' parameter")
	@NullSource
	@CsvSource({"invalidPublicKey"})
	void getHttp403ForAccountEmailVerifyWithNullAndInvalidPublicKeyParam(String publicKey) {
		String code = String.valueOf(faker.number().randomNumber(6, false));
		String authToken = Base64Utils.encodeAuthToken(account3Id, publicKey, account3Signature);

		accountApiSteps.verifyEmail(authToken, code).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Account astro-automation-reserved6.testnet identity is invalid - public key"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for account email verify with empty 'publicKey' parameter")
	@DisplayName("Get HTTP 403 for account email verify with empty 'publicKey' parameter")
	void getHttp403ForAccountEmailVerifyWithEmptyPublicKeyParam() {
		String code = String.valueOf(faker.number().randomNumber(6, false));
		String authToken = Base64Utils.encodeAuthToken(account3Id, EMPTY_STRING, account3Signature);

		accountApiSteps.verifyEmail(authToken, code).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for account email verify with invalid 'signature' parameter")
	@DisplayName("Get HTTP 403 for account email verify with invalid 'signature' parameter")
	void getHttp403ForAccountEmailVerifyWithInvalidSignatureParam() {
		String invalidSignature = account3Signature.substring(7);
		String code = String.valueOf(faker.number().randomNumber(6, false));
		String authToken = Base64Utils.encodeAuthToken(account3Id, account3PublicKey, invalidSignature);

		accountApiSteps.verifyEmail(authToken, code).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Invalid signature"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for account email verify with null 'signature' parameter")
	@DisplayName("Get HTTP 403 for account email verify with null 'signature' parameter")
	void getHttp403ForAccountEmailVerifyWithNullSignatureParam() {
		String code = String.valueOf(faker.number().randomNumber(6, false));
		String authToken = Base64Utils.encodeAuthToken(account3Id, account3PublicKey, null);

		accountApiSteps.verifyEmail(authToken, code).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Invalid signature"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for account email verify with empty 'signature' parameter")
	@DisplayName("Get HTTP 403 for account email verify with empty 'signature' parameter")
	void getHttp403ForForAccountEmailVerifyWithEmptySignatureParam() {
		String code = String.valueOf(faker.number().randomNumber(6, false));
		String authToken = Base64Utils.encodeAuthToken(account3Id, account3PublicKey, EMPTY_STRING);

		accountApiSteps.verifyEmail(authToken, code).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for account email verify with empty 'accountId' parameter")
	@DisplayName("Get HTTP 403 for account email verify with empty 'accountId' parameter")
	void getHttp403ForAccountEmailVerifyWithEmptyAccountIdParam() {
		String code = String.valueOf(faker.number().randomNumber(6, false));
		String authToken = Base64Utils.encodeAuthToken(EMPTY_STRING, account3PublicKey, account3Signature);

		accountApiSteps.verifyEmail(authToken, code).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@ParameterizedTest
	@NullSource
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for account email verify with null and invalid 'accountId' parameter")
	@DisplayName("Get HTTP 403 for account email verify with null and invalid 'accountId' parameter")
	@CsvSource({"astro-automation.testnet", "another-magic.near", "test-dao-1641395769436.sputnikv2.testnet"})
	void getHttp403ForAccountEmailVerifyWithNullAndInvalidAccountIdParam(String accountId) {
		String code = String.valueOf(faker.number().randomNumber(6, false));
		String authToken = Base64Utils.encodeAuthToken(accountId, account3PublicKey, account3Signature);
		String errorMessage = String.format("Account %s identity is invalid - public key", accountId);

		accountApiSteps.verifyEmail(authToken, code).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Forbidden"));
	}
}
