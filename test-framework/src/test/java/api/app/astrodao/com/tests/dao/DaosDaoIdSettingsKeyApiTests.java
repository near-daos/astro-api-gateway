package api.app.astrodao.com.tests.dao;

import api.app.astrodao.com.core.utils.Base64Utils;
import api.app.astrodao.com.steps.DaoApiSteps;
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

import java.util.HashMap;
import java.util.Map;

import static api.app.astrodao.com.core.Constants.Variables.EMPTY_STRING;
import static java.net.HttpURLConnection.HTTP_FORBIDDEN;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("daosDaoIdSettingsKeyApiTests")})
@Epic("DAO")
@Feature("/daos/{daoId}/settings/{key} API tests")
@DisplayName("/daos/{daoId}/settings/{key} API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class DaosDaoIdSettingsKeyApiTests extends BaseTest {
	private final Faker faker;
	private final DaoApiSteps daoApiSteps;

	@Value("${test.dao2}")
	private String testDao;

	@Value("${accounts.account1.token}")
	private String accountAuthToken;

	@Value("${accounts.account1.accountId}")
	private String accountId;

	@Value("${accounts.account1.publicKey}")
	private String accountPublicKey;

	@Value("${accounts.account1.signature}")
	private String accountSignature;


	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Update DAO settings by 'daoId' and 'key' params")
	@DisplayName("Update DAO settings by 'daoId' and 'key' params")
	void updateDaoSettingsByDaoIdAndKeyParams() {
		String key = "hipsterWord";
		HashMap<String, String> fakeJson = new HashMap<>(Map.of(key, faker.hipster().word()));

		daoApiSteps.patchDaoSettings(testDao, fakeJson, accountAuthToken).then()
				.statusCode(HTTP_OK)
				.body("", equalTo(fakeJson));

		daoApiSteps.getDaoSettings(testDao).then()
				.statusCode(HTTP_OK)
				.body("", equalTo(fakeJson));


		String newValue = faker.harryPotter().spell();
		fakeJson.put(key, newValue);
		daoApiSteps.patchDaoSettingsByKey(testDao, key, newValue, accountAuthToken).then()
				.statusCode(HTTP_OK)
				.body("", equalTo(fakeJson));

		daoApiSteps.getDaoSettings(testDao).then()
				.statusCode(HTTP_OK)
				.body("", equalTo(fakeJson));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for update DAO settings by 'key' param with correct token and wrong 'daoId' parameter")
	@DisplayName("Get HTTP 403 for update DAO settings by 'key' param with correct token and wrong 'daoId' parameter")
	void getHttp403ForDaoSettingsByKeyParamWithCorrectTokenAndWrongDaoIdParam() {
		daoApiSteps.patchDaoSettingsByKey("rs-dao-1.sputnikv2.testnet", "hipsterWord", faker.hipster().word(), accountAuthToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Forbidden resource"),
				      "error", equalTo("Forbidden"));
	}

	@ParameterizedTest
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for update DAO settings by 'key' param with null and invalid 'accountId' parameter")
	@DisplayName("Get HTTP 403 for update DAO settings by 'key' param with null and invalid 'accountId' parameter")
	@NullSource
	@CsvSource({"astro-automation.testnet", "another-magic.near", "test-dao-1641395769436.sputnikv2.testnet"})
	void getHttp403ForDaoSettingsByKeyParamWithNullAndInvalidAccountIdParam(String accountId) {
		String authToken = Base64Utils.encodeAuthToken(accountId, accountPublicKey, accountSignature);
		String errorMessage = String.format("Account %s identity is invalid - public key", accountId);

		daoApiSteps.patchDaoSettingsByKey(testDao, "jodaQuote", faker.yoda().quote(), authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for update DAO settings by 'key' param with empty 'accountId' parameter")
	@DisplayName("Get HTTP 403 for update DAO settings by 'key' param with empty 'accountId' parameter")
	void getHttp403ForDaoSettingsByKeyParamWithEmptyAccountIdParam() {
		String authToken = Base64Utils.encodeAuthToken(EMPTY_STRING, accountPublicKey, accountSignature);

		daoApiSteps.patchDaoSettingsByKey(testDao, "jodaQuote", faker.yoda().quote(), authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@ParameterizedTest
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for update DAO settings by 'key' param with null and invalid 'publicKey' parameter")
	@DisplayName("Get HTTP 403 for update DAO settings by 'key' param with null and invalid 'publicKey' parameter")
	@NullSource
	@CsvSource({"invalidPublicKey"})
	void getHttp403ForDaoSettingsByKeyParamWithNullAndInvalidPublicKeyParam(String publicKey) {
		String authToken = Base64Utils.encodeAuthToken(accountId, publicKey, accountSignature);

		daoApiSteps.patchDaoSettingsByKey(testDao, "jodaQuote", faker.yoda().quote(), authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Account testdao2.testnet identity is invalid - public key"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for update DAO settings by 'key' param with empty 'publicKey' parameter")
	@DisplayName("Get HTTP 403 for update DAO settings by 'key' param with empty 'publicKey' parameter")
	void getHttp403ForDaoSettingsByKeyParamWithEmptyPublicKeyParam() {
		String authToken = Base64Utils.encodeAuthToken(accountId, EMPTY_STRING, accountSignature);

		daoApiSteps.patchDaoSettingsByKey(testDao, "jodaQuote", faker.yoda().quote(), authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for update DAO settings by 'key' param with invalid 'signature' parameter")
	@DisplayName("Get HTTP 403 for update DAO settings by 'key' param with invalid 'signature' parameter")
	void getHttp403ForDaoSettingsByKeyParamWithInvalidSignatureParam() {
		String invalidSignature = accountSignature.substring(10);
		String authToken = Base64Utils.encodeAuthToken(accountId, accountPublicKey, invalidSignature);

		daoApiSteps.patchDaoSettingsByKey(testDao, "jodaQuote", faker.yoda().quote(), authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Invalid signature"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for update DAO settings by 'key' param with null 'signature' parameter")
	@DisplayName("Get HTTP 403 for update DAO settings by 'key' param with null 'signature' parameter")
	void getHttp403ForDaoSettingsByKeyParamWithNullSignatureParam() {
		String authToken = Base64Utils.encodeAuthToken(accountId, accountPublicKey, null);

		daoApiSteps.patchDaoSettingsByKey(testDao, "jodaQuote", faker.yoda().quote(), authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Invalid signature"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for update DAO settings by 'key' param with empty 'signature' parameter")
	@DisplayName("Get HTTP 403 for update DAO settings by 'key' param with empty 'signature' parameter")
	void getHttp403ForDaoSettingsByKeyParamWithEmptySignatureParam() {
		String authToken = Base64Utils.encodeAuthToken(accountId, accountPublicKey, EMPTY_STRING);

		daoApiSteps.patchDaoSettingsByKey(testDao, "jodaQuote", faker.yoda().quote(), authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}
}
