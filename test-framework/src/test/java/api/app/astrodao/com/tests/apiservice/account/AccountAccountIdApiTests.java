package api.app.astrodao.com.tests.apiservice.account;

import api.app.astrodao.com.openapi.models.AccountResponse;
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

import static java.net.HttpURLConnection.HTTP_NOT_FOUND;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("accountIdApiTests")})
@Epic("Account")
@Feature("/account/{accountId} API tests")
@DisplayName("/account/{accountId} API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class AccountAccountIdApiTests extends BaseTest {
	private final AccountApiSteps accountApiSteps;

	@Value("${accounts.account1.accountId}")
	private String accountId1;

	@Value("${accounts.account2.accountId}")
	private String accountId2;

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get account settings with query param: [accountId]")
	@DisplayName("User should be able to get account settings with query param: [accountId]")
	void getAccountSettingsWithQueryParamAccountId() {
		AccountResponse accountResponse = accountApiSteps.getAccountSettingsById(accountId1)
				.then()
				.statusCode(HTTP_OK)
				.extract().as(AccountResponse.class);

		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getAccountId, accountId1, "accountId");
		accountApiSteps.assertDtoValueIsNull(accountResponse, AccountResponse::getEmail, "email");
		accountApiSteps.assertDtoValueIsNull(accountResponse, AccountResponse::getIsEmailVerified, "IsEmailVerified");
		accountApiSteps.assertDtoValueIsNull(accountResponse, AccountResponse::getPhoneNumber, "phoneNumber");
		accountApiSteps.assertDtoValueIsNull(accountResponse, AccountResponse::getIsPhoneVerified, "isPhoneVerified");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get account settings by query param [accountId] with not verified email and phone number")
	@DisplayName("User should be able to get account settings by query param [accountId] with not verified email and phone number")
	void getAccountSettingsWithQueryParamAccountIdWithNotVerifiedEmailAndPhoneNumber() {
		String email = "test-qgy8zs5q1@srv1.mail-tester.com";
		String phoneNumber = "+16465106465";

		AccountResponse accountResponse = accountApiSteps.getAccountSettingsById(accountId2)
				.then()
				.statusCode(HTTP_OK)
				.extract().as(AccountResponse.class);

		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getAccountId, accountId2, "accountId");
		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getEmail, email, "email");
		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getIsEmailVerified, false, "IsEmailVerified");
		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getPhoneNumber, phoneNumber, "phoneNumber");
		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getIsPhoneVerified, false, "isPhoneVerified");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get account settings by query param [accountId] with verified email and phone number")
	@DisplayName("User should be able to get account settings by query param [accountId] with verified email and phone number")
	void getAccountSettingsWithQueryParamAccountIdWithVerifiedEmailAndPhoneNumber() {
		String accountId = "astro-automation-reserved1.testnet";
		String email = "test-7nq1f6xe1@srv1.mail-tester.com";
		String phoneNumber = "+16466787403";

		AccountResponse accountResponse = accountApiSteps.getAccountSettingsById(accountId)
				.then()
				.statusCode(HTTP_OK)
				.extract().as(AccountResponse.class);

		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getAccountId, accountId, "accountId");
		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getEmail, email, "email");
		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getIsEmailVerified, true, "IsEmailVerified");
		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getPhoneNumber, phoneNumber, "phoneNumber");
		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getIsPhoneVerified, true, "isPhoneVerified");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get account settings by query param [accountId] with verified email and not verified phone number")
	@DisplayName("User should be able to get account settings by query param [accountId] with verified email and not verified phone number")
	void getAccountSettingsWithQueryParamAccountIdWithVerifiedEmailAndNotVerifiedPhoneNumber() {
		String accountId = "astro-automation-reserved2.testnet";
		String email = "test-f4r4vf6b9@srv1.mail-tester.com";
		String phoneNumber = "+16466623058";

		AccountResponse accountResponse = accountApiSteps.getAccountSettingsById(accountId)
				.then()
				.statusCode(HTTP_OK)
				.extract().as(AccountResponse.class);

		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getAccountId, accountId, "accountId");
		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getEmail, email, "email");
		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getIsEmailVerified, true, "IsEmailVerified");
		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getPhoneNumber, phoneNumber, "phoneNumber");
		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getIsPhoneVerified, false, "isPhoneVerified");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get account settings by query param [accountId] with verified phone number and not verified email")
	@DisplayName("User should be able to get account settings by query param [accountId] with verified phone number and not verified email")
	void getAccountSettingsWithQueryParamAccountIdWithVerifiedPhoneNumberAndNotVerifiedEmail() {
		String accountId = "astro-automation-reserved3.testnet";
		String email = "test-g0435jz8u@srv1.mail-tester.com";
		String phoneNumber = "+14132135672";

		AccountResponse accountResponse = accountApiSteps.getAccountSettingsById(accountId)
				.then()
				.statusCode(HTTP_OK)
				.extract().as(AccountResponse.class);

		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getAccountId, accountId, "accountId");
		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getEmail, email, "email");
		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getIsEmailVerified, false, "IsEmailVerified");
		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getPhoneNumber, phoneNumber, "phoneNumber");
		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getIsPhoneVerified, true, "isPhoneVerified");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get account settings by query param [accountId] with verified phone number and no email")
	@DisplayName("User should be able to get account settings by query param [accountId] with verified phone number and no email")
	void getAccountSettingsWithQueryParamAccountIdWithVerifiedPhoneNumberAndNoEmail() {
		String accountId = "astro-automation-reserved4.testnet";
		String phoneNumber = "+18034866798";

		AccountResponse accountResponse = accountApiSteps.getAccountSettingsById(accountId)
				.then()
				.statusCode(HTTP_OK)
				.extract().as(AccountResponse.class);

		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getAccountId, accountId, "accountId");
		accountApiSteps.assertDtoValueIsNull(accountResponse, AccountResponse::getEmail, "email");
		accountApiSteps.assertDtoValueIsNull(accountResponse, AccountResponse::getIsEmailVerified, "IsEmailVerified");
		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getPhoneNumber, phoneNumber, "phoneNumber");
		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getIsPhoneVerified, true, "isPhoneVerified");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get account settings by query param [accountId] with verified email and no phone number")
	@DisplayName("User should be able to get account settings by query param [accountId] with verified email and no phone number")
	void getAccountSettingsWithQueryParamAccountIdWithVerifiedEmailAndNoPhoneNumber() {
		String accountId = "astro-automation-reserved5.testnet";
		String email = "test-a4rt25hpd@srv1.mail-tester.com";

		AccountResponse accountResponse = accountApiSteps.getAccountSettingsById(accountId)
				.then()
				.statusCode(HTTP_OK)
				.extract().as(AccountResponse.class);

		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getAccountId, accountId, "accountId");
		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getEmail, email, "email");
		accountApiSteps.assertDtoValue(accountResponse, AccountResponse::getIsEmailVerified, true, "IsEmailVerified");
		accountApiSteps.assertDtoValueIsNull(accountResponse, AccountResponse::getPhoneNumber, "phoneNumber");
		accountApiSteps.assertDtoValueIsNull(accountResponse, AccountResponse::getIsPhoneVerified, "isPhoneVerified");
	}

}
