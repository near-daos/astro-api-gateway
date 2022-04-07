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
}
