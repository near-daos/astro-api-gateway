package api.app.astrodao.com.tests.account;

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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import static java.net.HttpURLConnection.*;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("accountAccountIdPhoneVerificationStatusApiTests")})
@Epic("Account")
@Feature("/account/{accountId}/phone/verification-status API tests")
@DisplayName("/account/{accountId}/phone/verification-status API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class AccountAccountIdPhoneVerificationStatusApiTests extends BaseTest {
	private final AccountApiSteps accountApiSteps;

	@Value("${accounts.account1.accountId}")
	private String accountId1;

	@Value("${accounts.account2.accountId}")
	private String accountId2;

	@Value("${accounts.account4.accountId}")
	private String accountId4;


	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get phone verification status by 'accountId' parameter for verified account")
	@DisplayName("User should be able to get phone verification status by 'accountId' parameter for verified account")
	void getAccountIdPhoneVerificationStatusForVerifiedAccount() {
		VerificationStatus verificationStatus = accountApiSteps.getAccountPhoneVerificationStatus(accountId4).then()
				.statusCode(HTTP_OK)
				.extract().as(VerificationStatus.class);

		accountApiSteps.assertDtoValue(verificationStatus, VerificationStatus::getIsVerified, true, "isVerified");
		accountApiSteps.assertDtoValueIsNull(verificationStatus, VerificationStatus::getIsSend, "isSend");
		accountApiSteps.assertDtoValueIsNull(verificationStatus, VerificationStatus::getCreatedAt, "createdAt");
		accountApiSteps.assertDtoValueIsNull(verificationStatus, VerificationStatus::getTtl, "ttl");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get phone verification status by 'accountId' parameter for not verified account")
	@DisplayName("User should be able to get phone verification status by 'accountId' parameter for not verified account")
	void getAccountIdPhoneVerificationStatusForNotVerifiedAccount() {
		VerificationStatus verificationStatus = accountApiSteps.getAccountPhoneVerificationStatus(accountId2).then()
				.statusCode(HTTP_OK)
				.extract().as(VerificationStatus.class);

		accountApiSteps.assertDtoValue(verificationStatus, VerificationStatus::getIsVerified, false, "isVerified");
		accountApiSteps.assertDtoValue(verificationStatus, VerificationStatus::getIsSend, false, "isSend");
		accountApiSteps.assertDtoValueIsNull(verificationStatus, VerificationStatus::getCreatedAt, "createdAt");
		accountApiSteps.assertDtoValueIsNull(verificationStatus, VerificationStatus::getTtl, "ttl");
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 400 for phone verification status for account without phone number")
	@DisplayName("Get HTTP 400 for phone verification status for account without phone number")
	void getHttp400ForPhoneVerificationStatusForAccountWithoutPhoneNumber() {
		String errorMessage = String.format("No phone number found for account: %s", accountId1);

		accountApiSteps.getAccountPhoneVerificationStatus(accountId1).then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Bad Request"));
	}

	@ParameterizedTest
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 404 for phone verification status endpoint for non-existing account")
	@DisplayName("Get HTTP 404 for phone verification status endpoint for non-existing account")
	@CsvSource({"astro-automation.testnet", "another-magic.near"})
	void getHttp404ForPhoneVerificationStatusEndpointForNonExistingAccount(String accountId) {
		String errorMessage = String.format("Account does not exist: %s", accountId);

		accountApiSteps.getAccountPhoneVerificationStatus(accountId).then()
				.statusCode(HTTP_NOT_FOUND)
				.body("statusCode", equalTo(HTTP_NOT_FOUND),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Not Found"));
	}
}