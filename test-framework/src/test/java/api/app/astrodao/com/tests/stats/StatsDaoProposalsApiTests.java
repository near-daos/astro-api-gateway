package api.app.astrodao.com.tests.stats;

import api.app.astrodao.com.core.dto.api.stats.ProposalStatsEntries;
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

@Tags({@Tag("all"), @Tag("statsApiTests"), @Tag("statsDaoProposalsApiTests")})
@Epic("Stats")
@Feature("/stats/dao/{id}/proposals API tests")
@DisplayName("/stats/dao/{id}/proposals API tests")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class StatsDaoProposalsApiTests extends BaseTest {
	private final StatsApiSteps statsApiSteps;

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Getting proposals for a DAO")
	@DisplayName("Getting proposals for a DAO")
	void gettingProposalsForDao() {
		String dao = "gaming.sputnikv2.testnet";

		ProposalStatsEntries statsEntries = statsApiSteps.getProposalsForDao(dao).then()
				.statusCode(HTTP_OK)
				.extract().as(ProposalStatsEntries.class);

		statsApiSteps.assertCollectionHasSizeGreaterThanOrEqualTo(statsEntries, 3);
		statsApiSteps.assertCollectionElementsHasValue(statsEntries, r -> !r.getTimestamp().toString().isBlank(), "timestamp");
		statsApiSteps.assertCollectionElementsHasValue(statsEntries, r -> r.getTotal().intValue() >= 0, "total");
		statsApiSteps.assertCollectionElementsHasValue(statsEntries, r -> r.getActive().intValue() >= 0, "active");
	}

	@ParameterizedTest
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 404 for DAO Proposals stats with invalid daoId")
	@DisplayName("Get HTTP 404 for DAO Proposals stats with invalid daoId")
	@CsvSource({"invalidDaoId", "2212332141", "-1", "0",
			"*", "null", "autotest-dao-1.sputnikv2.testnet-1", "another-magic.near"})
	void getHttp404ForDaoProposalsStatsWithInvalidDaoId(String invalidDaoId) {
		statsApiSteps.getProposalsForDao(invalidDaoId).then()
				.statusCode(HTTP_NOT_FOUND)
				.body("statusCode", equalTo(404),
				      "message", equalTo("Not Found"));
	}
}
