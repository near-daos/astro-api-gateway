package api.app.astrodao.com.tests.dao;

import api.app.astrodao.com.steps.DaoApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import com.github.javafaker.Faker;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.util.Map;

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
}
