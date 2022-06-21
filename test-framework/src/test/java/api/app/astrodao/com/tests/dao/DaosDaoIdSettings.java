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

import java.util.Map;

import static api.app.astrodao.com.core.Constants.Variables.EMPTY_STRING;
import static java.net.HttpURLConnection.HTTP_FORBIDDEN;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("daosDaoIdSettingsApiTests")})
@Epic("DAO")
@Feature("/daos/{daoId}/settings API tests")
@DisplayName("/daos/{daoId}/settings API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class DaosDaoIdSettings extends BaseTest {
	private final Faker faker;
	private final DaoApiSteps daoApiSteps;

	@Value("${test.dao1}")
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
	@Story("Patch and get DAO settings")
	@DisplayName("Patch and get DAO settings")
	void patchAndGetDaoSettings() {
		Map<String, String> fakeJson = Map.of("chuckNorrisFact", faker.chuckNorris().fact());

		daoApiSteps.patchDaoSettings(testDao, fakeJson, accountAuthToken).then()
				.statusCode(HTTP_OK)
				.body("", equalTo(fakeJson));

		daoApiSteps.getDaoSettings(testDao).then()
				.statusCode(HTTP_OK)
				.body("", equalTo(fakeJson));
	}

	@ParameterizedTest
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for DAO settings with null and invalid 'accountId' parameter")
	@DisplayName("Get HTTP 403 for DAO settings with null and invalid 'accountId' parameter")
	@NullSource
	@CsvSource({"astro-automation.testnet", "another-magic.near", "test-dao-1641395769436.sputnikv2.testnet"})
	void getHttp403ForDaoSettingsWithNullAndInvalidAccountIdParam(String accountId) {
		String authToken = Base64Utils.encodeAuthToken(accountId, accountPublicKey, accountSignature);
		String errorMessage = String.format("Account %s identity is invalid - public key", accountId);
		Map<String, String> fakeJson = Map.of("rickAndMortyQuote", faker.rickAndMorty().quote());

		daoApiSteps.patchDaoSettings(testDao, fakeJson, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for DAO settings with empty 'accountId' parameter")
	@DisplayName("Get HTTP 403 for DAO settings with empty 'accountId' parameter")
	void getHttp403ForDaoSettingsWithEmptyAccountIdParam() {
		String authToken = Base64Utils.encodeAuthToken(EMPTY_STRING, accountPublicKey, accountSignature);
		Map<String, String> fakeJson = Map.of("rickAndMortyQuote", faker.rickAndMorty().quote());

		daoApiSteps.patchDaoSettings(testDao, fakeJson, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@ParameterizedTest
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for DAO settings with null and invalid 'publicKey' parameter")
	@DisplayName("Get HTTP 403 for DAO settings with null and invalid 'publicKey' parameter")
	@NullSource
	@CsvSource({"invalidPublicKey"})
	void getHttp403ForDaoSettingsWithNullAndInvalidPublicKeyParam(String publicKey) {
		String authToken = Base64Utils.encodeAuthToken(accountId, publicKey, accountSignature);
		Map<String, String> fakeJson = Map.of("rickAndMortyQuote", faker.rickAndMorty().quote());

		daoApiSteps.patchDaoSettings(testDao, fakeJson, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Account testdao2.testnet identity is invalid - public key"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for DAO settings with empty 'publicKey' parameter")
	@DisplayName("Get HTTP 403 for DAO settings with empty 'publicKey' parameter")
	void getHttp403ForDaoSettingsWithEmptyPublicKeyParam() {
		String authToken = Base64Utils.encodeAuthToken(accountId, EMPTY_STRING, accountSignature);
		Map<String, String> fakeJson = Map.of("rickAndMortyQuote", faker.rickAndMorty().quote());

		daoApiSteps.patchDaoSettings(testDao, fakeJson, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for DAO settings with invalid 'signature' parameter")
	@DisplayName("Get HTTP 403 for DAO settings with invalid 'signature' parameter")
	void getHttp403ForDaoSettingsWithInvalidSignatureParam() {
		String invalidSignature = accountSignature.substring(10);
		String authToken = Base64Utils.encodeAuthToken(accountId, accountPublicKey, invalidSignature);
		Map<String, String> fakeJson = Map.of("rickAndMortyQuote", faker.rickAndMorty().quote());

		daoApiSteps.patchDaoSettings(testDao, fakeJson, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Invalid signature"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for DAO settings with null 'signature' parameter")
	@DisplayName("Get HTTP 403 for DAO settings with null 'signature' parameter")
	void getHttp403ForDaoSettingsWithNullSignatureParam() {
		String authToken = Base64Utils.encodeAuthToken(accountId, accountPublicKey, null);
		Map<String, String> fakeJson = Map.of("rickAndMortyQuote", faker.rickAndMorty().quote());

		daoApiSteps.patchDaoSettings(testDao, fakeJson, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Invalid signature"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 403 for DAO settings with empty 'signature' parameter")
	@DisplayName("Get HTTP 403 for DAO settings with empty 'signature' parameter")
	void getHttp403ForDaoSettingsWithEmptySignatureParam() {
		String authToken = Base64Utils.encodeAuthToken(accountId, accountPublicKey, EMPTY_STRING);
		Map<String, String> fakeJson = Map.of("rickAndMortyQuote", faker.rickAndMorty().quote());

		daoApiSteps.patchDaoSettings(testDao, fakeJson, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}
}
