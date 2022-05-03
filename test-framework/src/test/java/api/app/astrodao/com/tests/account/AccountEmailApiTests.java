package api.app.astrodao.com.tests.account;

import api.app.astrodao.com.openapi.models.AccountResponse;
import api.app.astrodao.com.steps.AccountApiSteps;
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

import static java.net.HttpURLConnection.HTTP_CREATED;

@Tags({@Tag("all"), @Tag("accountEmailApiTests")})
@Epic("Account")
@Feature("/account/email API tests")
@DisplayName("/account/email API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class AccountEmailApiTests extends BaseTest {
	private final AccountApiSteps accountApiSteps;
	private final DisposableEmailApiSteps disposableEmailApiSteps;

	@Value("${accounts.account3.accountId}")
	private String accountId;

	@Value("${accounts.account3.publicKey}")
	private String accountPublicKey;

	@Value("${accounts.account3.signature}")
	private String accountSignature;

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to set account email")
	@DisplayName("User should be able to set account email")
	void setAccountEmail() {
		String email = disposableEmailApiSteps.getEmail();

		AccountResponse accountResponse = accountApiSteps.postAccountEmail(accountId, accountPublicKey, accountSignature, email)
				.then()
				.statusCode(HTTP_CREATED)
				.extract().as(AccountResponse.class);

		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getAccountId, accountId, "accountId");
		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getEmail, email, "email");
		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getIsEmailVerified, false, "IsEmailVerified");
		accountApiSteps.assertDtoValueIsNull(accountResponse, AccountResponse::getPhoneNumber, "phoneNumber");
		accountApiSteps.assertDtoValueIsNull(accountResponse, AccountResponse::getIsPhoneVerified, "isPhoneVerified");
	}

}
