package api.app.astrodao.com.tests.stats;

import api.app.astrodao.com.openapi.models.DaoStatsStateDto;
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

@Tags({@Tag("all"), @Tag("statsApiTests"), @Tag("statsDaoStateApiTests")})
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
        String dao = "gaming.sputnikv2.testnet";

        DaoStatsStateDto daoStats = statsApiSteps.getStateForDao(dao).then()
                .statusCode(HTTP_OK)
                .extract().as(DaoStatsStateDto.class);

        statsApiSteps.assertDtoValue(daoStats, DaoStatsStateDto::getDaoId, dao, "id");
        statsApiSteps.assertDtoValueGreaterThan(daoStats, p -> p.getTotalDaoFunds().getValue().intValue(), 10, "totalDaoFunds/value");
        statsApiSteps.assertDtoValueGreaterThan(daoStats, p -> p.getTotalProposalCount().getValue().intValue(), 2, "totalProposal/value");
        statsApiSteps.assertDtoValueGreaterThanOrEqualTo(daoStats, p -> p.getBountyCount().getValue().intValue(), 0, "bountyCount/value");
        statsApiSteps.assertDtoValueGreaterThanOrEqualTo(daoStats, p -> p.getNftCount().getValue().intValue(), 2, "nftCount/value");
    }

    @ParameterizedTest
    @Severity(SeverityLevel.NORMAL)
    @Story("Get HTTP 404 for DAO state with invalid daoId")
    @DisplayName("Get HTTP 404 for DAO state with invalid daoId")
    @CsvSource({"invalidDaoId", "2212332141", "-1", "0",
            "*", "null", "autotest-dao-1.sputnikv2.testnet-1", "another-magic.near"})
    void getHttp404ForDaoStateWithInvalidDaoId(String invalidDaoId) {
        statsApiSteps.getStateForDao(invalidDaoId).then()
                .statusCode(HTTP_NOT_FOUND)
                .body("statusCode", equalTo(HTTP_NOT_FOUND),
                      "message", equalTo("Not Found"));
    }
}
