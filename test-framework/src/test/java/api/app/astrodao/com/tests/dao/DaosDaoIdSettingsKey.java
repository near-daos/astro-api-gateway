package api.app.astrodao.com.tests.dao;

import api.app.astrodao.com.steps.DaoApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import com.github.javafaker.Faker;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import static java.net.HttpURLConnection.HTTP_OK;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("daosDaoIdSettingsKeyApiTests")})
@Epic("DAO")
@Feature("/daos/{daoId}/settings/{key} API tests")
@DisplayName("/daos/{daoId}/settings/{key} API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class DaosDaoIdSettingsKey extends BaseTest {
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
}
