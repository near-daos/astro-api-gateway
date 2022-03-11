package api.app.astrodao.com.tests.stats;

import api.app.astrodao.com.core.dto.api.stats.ProposalStatsEntries;
import api.app.astrodao.com.steps.StatsApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@Tags({@Tag("all"), @Tag("statsDaoProposalsApiTests")})
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
		//TODO: Add steps to retrieve data for DAO from CLI
		String dao = "gaming.sputnikv2.testnet";

		ResponseEntity<String> response = statsApiSteps.getProposalsForDao(dao);
		statsApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

		ProposalStatsEntries statsEntries = statsApiSteps.getResponseDto(response, ProposalStatsEntries.class);

		statsApiSteps.assertCollectionHasSizeGreaterThanOrEqualTo(statsEntries, 3);
		statsApiSteps.assertCollectionElementsHasValue(statsEntries, r -> !r.getTimestamp().toString().isBlank(), "timestamp");
		statsApiSteps.assertCollectionElementsHasValue(statsEntries, r -> r.getTotal().intValue() >= 0, "total");
		statsApiSteps.assertCollectionElementsHasValue(statsEntries, r -> r.getActive().intValue() >= 0, "active");
	}
}
