package api.app.astrodao.com.tests.stats;

import api.app.astrodao.com.openapi.models.DaoStatsStateDto;
import api.app.astrodao.com.steps.StatsApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@Tags({@Tag("all"), @Tag("statsDaoStateApiTests")})
@Epic("Stats")
@Feature("/stats/dao/{id}/state API tests")
@DisplayName("/stats/dao/{id}/state API tests")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class StatsDaoStateApiTests extends BaseTest {
    private final StatsApiSteps statsApiSteps;

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Getting state for a DAO")
    @DisplayName("Getting state for a DAO")
    void getStateForDAO() {
        //TODO: Add steps to retrieve data for DAO from CLI
        String dao = "gaming.sputnikv2.testnet";

        ResponseEntity<String> response = statsApiSteps.getStateForDao(dao);
        statsApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        DaoStatsStateDto daoStats = statsApiSteps.getResponseDto(response, DaoStatsStateDto.class);

        statsApiSteps.assertDtoValue(daoStats, DaoStatsStateDto::getDaoId, dao, "id");
        statsApiSteps.assertDtoValueGreaterThan(daoStats, p -> p.getTotalDaoFunds().getValue().intValue(), 10, "totalDaoFunds/value");
        statsApiSteps.assertDtoValueGreaterThan(daoStats, p -> p.getTotalProposalCount().getValue().intValue(), 2, "totalProposal/value");
        statsApiSteps.assertDtoValueGreaterThanOrEqualTo(daoStats, p -> p.getBountyCount().getValue().intValue(), 0, "bountyCount/value");
        statsApiSteps.assertDtoValueGreaterThanOrEqualTo(daoStats, p -> p.getNftCount().getValue().intValue(), 2, "nftCount/value");
    }

}
