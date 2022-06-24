package api.app.astrodao.com.tests.stats;

import api.app.astrodao.com.core.dto.api.stats.StatsEntries;
import api.app.astrodao.com.steps.StatsApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;

import static java.net.HttpURLConnection.HTTP_NOT_FOUND;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("statsApiTests"), @Tag("statsDaoFundsApiTests")})
@Epic("Stats")
@Feature("/stats/dao/{id}/funds API tests")
@DisplayName("/stats/dao/{id}/funds API tests")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class StatsDaoFundsApiTests extends BaseTest {
	private final StatsApiSteps statsApiSteps;

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Getting funds for a DAO")
	@DisplayName("Getting funds for a DAO")
	void getFundsForDAO() {
		String dao = "gaming.sputnikv2.testnet";

		StatsEntries statsEntries = statsApiSteps.getFundsForDao(dao).then()
				.statusCode(HTTP_OK)
				.extract().as(StatsEntries.class);

		statsApiSteps.assertCollectionHasSizeGreaterThanOrEqualTo(statsEntries, 79);
		statsApiSteps.assertCollectionElementsHasValue(statsEntries, r -> r.getValue().intValue() >= 0, "value");
		statsApiSteps.assertCollectionElementsHasValue(statsEntries, r -> !r.getTimestamp().toString().isBlank(), "timestamp");
	}

	@ParameterizedTest
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 404 for DAO funds with invalid daoId")
	@DisplayName("Get HTTP 404 for DAO funds with invalid daoId")
	@CsvSource({"invalidDaoId", "2212332141", "-1", "0",
			"*", "null", "autotest-dao-1.sputnikv2.testnet-1", "another-magic.near"})
	void getHttp404ForDaoFundsWithInvalidDaoId(String invalidDaoId) {
		statsApiSteps.getFundsForDao(invalidDaoId).then()
				.statusCode(HTTP_NOT_FOUND)
				.body("statusCode", equalTo(HTTP_NOT_FOUND),
				      "message", equalTo("Not Found"));
	}
}
