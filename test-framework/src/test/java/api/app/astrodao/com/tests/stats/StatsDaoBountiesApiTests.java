package api.app.astrodao.com.tests.stats;

import api.app.astrodao.com.core.dto.api.stats.StatsEntries;
import api.app.astrodao.com.steps.StatsApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;

import static java.net.HttpURLConnection.HTTP_OK;

@Tags({@Tag("all"), @Tag("statsApiTests"), @Tag("statsDaoBountiesApiTests")})
@Epic("Stats")
@Feature("/stats/dao/{id}/bounties API tests")
@DisplayName("/stats/dao/{id}/bounties API tests")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class StatsDaoBountiesApiTests extends BaseTest {
	private final StatsApiSteps statsApiSteps;

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Getting bounties for a DAO")
	@DisplayName("Getting bounties for a DAO")
	void getBountiesForDAO() {
		//TODO: Add steps to retrieve data for DAO from CLI
		String dao = "gaming.sputnikv2.testnet";

		StatsEntries statsEntries = statsApiSteps.getBountiesForDao(dao).then()
				.statusCode(HTTP_OK)
				.extract().as(StatsEntries.class);

		statsApiSteps.assertCollectionHasSizeGreaterThanOrEqualTo(statsEntries, 3);
		statsApiSteps.assertCollectionElementsHasValue(statsEntries, r -> r.getValue().intValue() >= 0, "value");
		statsApiSteps.assertCollectionElementsHasValue(statsEntries, r -> !r.getTimestamp().toString().isBlank(), "timestamp");
	}
}
