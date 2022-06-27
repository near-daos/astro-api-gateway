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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import static java.net.HttpURLConnection.HTTP_OK;

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
}