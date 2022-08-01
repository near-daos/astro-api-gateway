package api.app.astrodao.com.tests.apiservice.account;

import api.app.astrodao.com.openapi.models.AccountResponse;
import api.app.astrodao.com.openapi.models.VerificationStatus;
import api.app.astrodao.com.steps.apiservice.AccountApiSteps;
import api.app.astrodao.com.steps.util.DisposableEmailApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;

import static java.net.HttpURLConnection.HTTP_CREATED;

@Tags({@Tag("all"), @Tag("accountEmailVerificationApiTests")})
@Epic("Account")
@Feature("Email verification E2E API tests")
@DisplayName("Email verification E2E API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class AccountEmailVerificationTests extends BaseTest {
	private final AccountApiSteps accountApiSteps;
	private final DisposableEmailApiSteps disposableEmailApiSteps;

	@Value("${accounts.account3.accountId}")
	private String accountId;

	@Value("${accounts.account3.token}")
	private String authToken;


	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able successfully verify account email")
	@DisplayName("User should be able successfully verify account email")
	@Description("Following 'Account' endpoints were triggered: /email; /send-verification; /verify")
	void successfulVerificationOfAccountEmail() {
		String email = disposableEmailApiSteps.getEmail();
		List<String> loginDomain = List.of(email.split("@"));

		//set email
		AccountResponse accountResponse = accountApiSteps.setAccountEmail(authToken, email)
				.then()
				.statusCode(HTTP_CREATED)
				.extract().as(AccountResponse.class);

		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getAccountId, accountId, "accountId");
		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getEmail, email, "email");
		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getIsEmailVerified, false, "IsEmailVerified");
		accountApiSteps.assertDtoValueIsNull(accountResponse, AccountResponse::getPhoneNumber, "phoneNumber");
		accountApiSteps.assertDtoValueIsNull(accountResponse, AccountResponse::getIsPhoneVerified, "isPhoneVerified");

		//send-verification code
		VerificationStatus verificationStatus = accountApiSteps.sendEmailVerificationCode(authToken).then()
				.statusCode(HTTP_CREATED)
				.extract().as(VerificationStatus.class);

		accountApiSteps.assertDtoValue(verificationStatus, VerificationStatus::getIsVerified, false, "isVerified");
		accountApiSteps.assertDtoValue(verificationStatus, VerificationStatus::getIsSend, true, "isSend");
		accountApiSteps.assertDtoHasValue(verificationStatus, VerificationStatus::getCreatedAt, "createdAt");
		accountApiSteps.assertDtoHasValue(verificationStatus, VerificationStatus::getTtl, "ttl");

		//polling mailbox and get email id
		String emailId = disposableEmailApiSteps.pollingMailBoxAndGetEmailId(loginDomain.get(0), loginDomain.get(1));

		//get verification code from email body
		String verificationCode = disposableEmailApiSteps.getEmailVerificationCode(loginDomain.get(0), loginDomain.get(1), emailId);

		//verify email
		accountApiSteps.verifyEmail(authToken, verificationCode).then()
				.statusCode(HTTP_CREATED);
	}
}
