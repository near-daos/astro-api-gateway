package api.app.astrodao.com.tests.account;

import api.app.astrodao.com.core.utils.Base64Utils;
import api.app.astrodao.com.openapi.models.VerificationStatus;
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

import static api.app.astrodao.com.core.Constants.Variables.EMPTY_STRING;
import static java.net.HttpURLConnection.*;
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

	@Value("${accounts.account1.token}")
	private String account1token;

	@Value("${accounts.account2.token}")
	private String account2token;

	@Value("${accounts.account4.token}")
	private String account4token;


	@ParameterizedTest
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for account email send verification with null and invalid 'publicKey' parameter")
	@DisplayName("Get HTTP 403 for account email send verification with null and invalid 'publicKey' parameter")
	@NullSource
	@CsvSource({"invalidPublicKey"})
	void getHttp403ForAccountEmailSendVerificationWithNullAndInvalidPublicKeyParam(String publicKey) {
		String authToken = Base64Utils.encodeAuthToken(accountId, publicKey, accountSignature);

		accountApiSteps.sendEmailVerificationCode(authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Account astro-automation-reserved6.testnet identity is invalid - public key"),
				      "error", equalTo("Forbidden"));
	}

	@ParameterizedTest
	@NullSource
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for account email send verification with null and invalid 'accountId' parameter")
	@DisplayName("Get HTTP 403 for account email send verification with null and invalid 'accountId' parameter")
	@CsvSource({"astro-automation.testnet", "another-magic.near", "test-dao-1641395769436.sputnikv2.testnet"})
	void getHttp403ForAccountEmailSendVerificationWithNullAndInvalidAccountIdParam(String accountId) {
		String authToken = Base64Utils.encodeAuthToken(accountId, accountPublicKey, accountSignature);
		String errorMessage = String.format("Account %s identity is invalid - public key", accountId);

		accountApiSteps.sendEmailVerificationCode(authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for account email send verification with invalid 'signature' parameter")
	@DisplayName("Get HTTP 403 for account email send verification with invalid 'signature' parameter")
	void getHttp403ForAccountEmailSendVerificationWithInvalidSignatureParam() {
		String invalidSignature = accountSignature.substring(7);
		String authToken = Base64Utils.encodeAuthToken(accountId, accountPublicKey, invalidSignature);

		accountApiSteps.sendEmailVerificationCode(authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Invalid signature"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for account email send verification with null 'signature' parameter")
	@DisplayName("Get HTTP 403 for account email send verification with null 'signature' parameter")
	void getHttp403ForAccountEmailSendVerificationWithNullSignatureParam() {
		String authToken = Base64Utils.encodeAuthToken(accountId, accountPublicKey, null);

		accountApiSteps.sendEmailVerificationCode(authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Invalid signature"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for account email send verification with empty 'accountId' parameter")
	@DisplayName("Get HTTP 403 for account email send verification with empty 'accountId' parameter")
	void getHttp403ForAccountEmailSendVerificationWithEmptyAccountIdParam() {
		String authToken = Base64Utils.encodeAuthToken(EMPTY_STRING, accountPublicKey, accountSignature);

		accountApiSteps.sendEmailVerificationCode(authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for account email send verification with empty 'signature' parameter")
	@DisplayName("Get HTTP 403 for account email send verification with empty 'signature' parameter")
	void getHttp403ForAccountEmailSendVerificationWithEmptySignatureParam() {
		String authToken = Base64Utils.encodeAuthToken(accountId, accountPublicKey, EMPTY_STRING);

		accountApiSteps.sendEmailVerificationCode(authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for account email send verification with empty 'publicKey' parameter")
	@DisplayName("Get HTTP 403 for account email send verification with empty 'publicKey' parameter")
	void getHttp403ForAccountEmailSendVerificationWithEmptyPublicKeyParam() {
		String authToken = Base64Utils.encodeAuthToken(accountId, EMPTY_STRING, accountSignature);

		accountApiSteps.sendEmailVerificationCode(authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 400 for account email send verification with no account email")
	@DisplayName("Get HTTP 400 for account email send verification with no account email")
	void getHttp400ForAccountEmailSendVerificationForNoAccountEmail() {
		accountApiSteps.sendEmailVerificationCode(account1token).then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo("No email found for account: testdao2.testnet"),
				      "error", equalTo("Bad Request"));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 400 for account email send verification for non-existing account email")
	@DisplayName("Get HTTP 400 for account email send verification for non-existing account email")
	void getHttp400ForAccountEmailSendVerificationForNonExistingAccountEmail() {
		accountApiSteps.sendEmailVerificationCode(account4token).then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo("Email is already verified"),
				      "error", equalTo("Bad Request"));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 400 for account email send verification when sending the code again")
	@DisplayName("Get HTTP 400 for account email send verification when sending the code again")
	void getHttp400ForAccountEmailSendVerificationWhenSendingTheCodeAgain() {
		VerificationStatus verificationStatus = accountApiSteps.sendEmailVerificationCode(account2token).then()
				.statusCode(HTTP_CREATED)
				.extract().as(VerificationStatus.class);

		accountApiSteps.assertDtoValue(verificationStatus, VerificationStatus::getIsVerified, false, "isVerified");
		accountApiSteps.assertDtoValue(verificationStatus, VerificationStatus::getIsSend, true, "isSend");
		accountApiSteps.assertDtoHasValue(verificationStatus, VerificationStatus::getCreatedAt, "createdAt");
		accountApiSteps.assertDtoHasValue(verificationStatus, VerificationStatus::getTtl, "ttl");

		accountApiSteps.sendEmailVerificationCode(account2token).then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo("Email verification already sent. Could be resend after 60 seconds"),
				      "error", equalTo("Bad Request"));
	}
}