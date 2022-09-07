package api.app.astrodao.com.tests.apiservice.account;

import api.app.astrodao.com.openapi.models.VerificationStatus;
import api.app.astrodao.com.steps.apiservice.AccountApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import static java.net.HttpURLConnection.*;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("accountAccountIdEmailVerificationStatusApiTests")})
@Epic("Account")
@Feature("/account/{accountId}/email/verification-status API tests")
@DisplayName("/account/{accountId}/email/verification-status API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class AccountAccountIdEmailVerificationStatusApiTests extends BaseTest {
	private final AccountApiSteps accountApiSteps;

	@Value("${accounts.account1.accountId}")
	private String accountId1;

	@Value("${accounts.account4.accountId}")
	private String accountId4;

	@Value("${accounts.account5.accountId}")
	private String accountId5;

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get email verification status by 'accountId' parameter for verified account")
	@DisplayName("User should be able to get email verification status by 'accountId' parameter for verified account")
	void getAccountIdEmailVerificationStatusForVerifiedAccount() {
		VerificationStatus verificationStatus = accountApiSteps.getAccountEmailVerificationStatus(accountId4).then()
				.statusCode(HTTP_OK)
				.extract().as(VerificationStatus.class);

		accountApiSteps.assertDtoValue(verificationStatus, VerificationStatus::getIsVerified, true, "isVerified");
		accountApiSteps.assertDtoValueIsNull(verificationStatus, VerificationStatus::getIsSend, "isSend");
		accountApiSteps.assertDtoValueIsNull(verificationStatus, VerificationStatus::getCreatedAt, "createdAt");
		accountApiSteps.assertDtoValueIsNull(verificationStatus, VerificationStatus::getTtl, "ttl");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get email verification status by 'accountId' parameter for not verified account")
	@DisplayName("User should be able to get email verification status by 'accountId' parameter for not verified account")
	void getAccountIdEmailVerificationStatusForNotVerifiedAccount() {
		VerificationStatus verificationStatus = accountApiSteps.getAccountEmailVerificationStatus(accountId5).then()
				.statusCode(HTTP_OK)
				.extract().as(VerificationStatus.class);

		accountApiSteps.assertDtoValue(verificationStatus, VerificationStatus::getIsVerified, false, "isVerified");
		accountApiSteps.assertDtoValue(verificationStatus, VerificationStatus::getIsSend, false, "isSend");
		accountApiSteps.assertDtoValueIsNull(verificationStatus, VerificationStatus::getCreatedAt, "createdAt");
		accountApiSteps.assertDtoValueIsNull(verificationStatus, VerificationStatus::getTtl, "ttl");
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 400 for email verification status for account without email")
	@DisplayName("Get HTTP 400 for email verification status for account without email")
	void getHttp400ForEmailVerificationStatusForAccountWithoutEmailNumber() {
		String errorMessage = String.format("No email found for account: %s", accountId1);

		accountApiSteps.getAccountEmailVerificationStatus(accountId1).then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Bad Request"));
	}

}