package api.app.astrodao.com.tests.account;

import api.app.astrodao.com.steps.AccountApiSteps;
import api.app.astrodao.com.steps.util.DisposableEmailApiSteps;
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

import java.util.List;

import static java.net.HttpURLConnection.*;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("accountEmailApiTests")})
@Epic("Account")
@Feature("/account/email API tests")
@DisplayName("/account/email API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class AccountEmailApiTests extends BaseTest {
	private final AccountApiSteps accountApiSteps;
	private final DisposableEmailApiSteps disposableEmailApiSteps;
	public final static String EMPTY_STRING = "";
	String email = "test-web-mail@invalidwebmail.com";

	@Value("${accounts.account3.accountId}")
	private String accountId;

	@Value("${accounts.account3.publicKey}")
	private String accountPublicKey;

	@Value("${accounts.account3.signature}")
	private String accountSignature;


//	@Test
//	@Severity(SeverityLevel.CRITICAL)
//	@Story("User should be able to set account email")
//	@DisplayName("User should be able to set account email")
//	void setAccountEmail() {
//		String email = disposableEmailApiSteps.getEmail();
//
//		AccountResponse accountResponse = accountApiSteps.postAccountEmail(accountId, accountPublicKey, accountSignature, email)
//				.then()
//				.statusCode(HTTP_CREATED)
//				.extract().as(AccountResponse.class);
//
//		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getAccountId, accountId, "accountId");
//		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getEmail, email, "email");
//		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getIsEmailVerified, false, "IsEmailVerified");
//		accountApiSteps.assertDtoValueIsNull(accountResponse, AccountResponse::getPhoneNumber, "phoneNumber");
//		accountApiSteps.assertDtoValueIsNull(accountResponse, AccountResponse::getIsPhoneVerified, "isPhoneVerified");
//	}

	@ParameterizedTest
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for account email with null and empty 'accountId' parameter")
	@DisplayName("Get HTTP 403 for account email with null and empty 'accountId' parameter")
	@NullAndEmptySource
	void getHttp403ForAccountEmailWithNullAndEmptyAccountIdParam(String accountId) {
		accountApiSteps.setAccountEmail(accountId, accountPublicKey, accountSignature, email)
				.then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@ParameterizedTest
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for account email with invalid 'accountId' parameter")
	@DisplayName("Get HTTP 403 for account email with invalid 'accountId' parameter")
	@CsvSource({"astro-automation.testnet", "another-magic.near", "test-dao-1641395769436.sputnikv2.testnet"})
	void getHttp403ForAccountEmailWithInvalidAccountIdParam(String accountId) {
		String errorMessage = String.format("Account %s identity is invalid - public key", accountId);

		accountApiSteps.setAccountEmail(accountId, accountPublicKey, accountSignature, email)
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
	@NullAndEmptySource
	@CsvSource({"invalidPublicKey"})
	void getHttp403ForAccountEmailWithInvalidPublicKeyParam(String publicKey) {
		accountApiSteps.setAccountEmail(accountId, publicKey, accountSignature, email)
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
		accountApiSteps.setAccountEmail(accountId, accountPublicKey, invalidSignature, email)
				.then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Invalid signature"),
				      "error", equalTo("Forbidden"));
	}

	@ParameterizedTest
	@NullAndEmptySource
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for account email with null and empty 'signature' parameter")
	@DisplayName("Get HTTP 403 for account email with null and empty 'signature' parameter")
	void getHttp403ForAccountEmailWithNullAndEmptySignatureParam(String signature) {
		accountApiSteps.setAccountEmail(accountId, accountPublicKey, signature, email)
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

		accountApiSteps.setAccountEmail(accountId, accountPublicKey, accountSignature, EMPTY_STRING)
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

		accountApiSteps.setAccountEmail(accountId, accountPublicKey, accountSignature, null)
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

		accountApiSteps.setAccountEmail(accountId, accountPublicKey, accountSignature, invalidEmail)
				.then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Bad Request"));
	}
}
