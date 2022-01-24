package api.app.astrodao.com.tests;

import api.app.astrodao.com.core.dto.api.stats.ProposalStatsEntries;
import api.app.astrodao.com.core.dto.api.stats.StatsEntries;
import api.app.astrodao.com.openapi.models.DaoStatsStateDto;
import api.app.astrodao.com.steps.StatsApiSteps;
import com.github.javafaker.Faker;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@Tags({@Tag("all"), @Tag("statsApiTests")})
@Feature("STATS API TESTS")
@DisplayName("STATS API TESTS")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class StatsApiTests extends BaseTest {
    private final StatsApiSteps statsApiSteps;

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Getting state for a DAO")
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

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Getting funds for a DAO")
    void getFundsForDAO() {
        //TODO: Add steps to retrieve data for DAO from CLI
        String dao = "gaming.sputnikv2.testnet";

        ResponseEntity<String> response = statsApiSteps.getFundsForDao(dao);
        statsApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        StatsEntries statsEntries = statsApiSteps.getResponseDto(response, StatsEntries.class);

        statsApiSteps.assertCollectionHasCorrectSize(statsEntries, 6);
        statsApiSteps.assertCollectionElementsHasValue(statsEntries, r -> r.getValue().intValue() >= 0, "value");
        statsApiSteps.assertCollectionElementsHasValue(statsEntries, r -> !r.getTimestamp().toString().isBlank(), "timestamp");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Getting bounties for a DAO")
    void getBountiesForDAO() {
        //TODO: Add steps to retrieve data for DAO from CLI
        String dao = "gaming.sputnikv2.testnet";

        ResponseEntity<String> response = statsApiSteps.getBountiesForDao(dao);
        statsApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        StatsEntries statsEntries = statsApiSteps.getResponseDto(response, StatsEntries.class);

        statsApiSteps.assertCollectionHasCorrectSize(statsEntries, 6);
        statsApiSteps.assertCollectionElementsHasValue(statsEntries, r -> r.getValue().intValue() >= 0, "value");
        statsApiSteps.assertCollectionElementsHasValue(statsEntries, r -> !r.getTimestamp().toString().isBlank(), "timestamp");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Getting NFTs for a DAO")
    void gettingNFTsForDao() {
        //TODO: Add steps to retrieve data for DAO from CLI
        String dao = "gaming.sputnikv2.testnet";

        ResponseEntity<String> response = statsApiSteps.getNFTsForDao(dao);
        statsApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        StatsEntries statsEntries = statsApiSteps.getResponseDto(response, StatsEntries.class);

        statsApiSteps.assertCollectionHasCorrectSize(statsEntries, 6);
        statsApiSteps.assertCollectionElementsHasValue(statsEntries, r -> r.getValue().intValue() >= 0, "value");
        statsApiSteps.assertCollectionElementsHasValue(statsEntries, r -> !r.getTimestamp().toString().isBlank(), "timestamp");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Getting proposals for a DAO")
    void gettingProposalsForDao() {
        //TODO: Add steps to retrieve data for DAO from CLI
        String dao = "gaming.sputnikv2.testnet";

        ResponseEntity<String> response = statsApiSteps.getProposalsForDao(dao);
        statsApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        ProposalStatsEntries statsEntries = statsApiSteps.getResponseDto(response, ProposalStatsEntries.class);

        statsApiSteps.assertCollectionHasCorrectSize(statsEntries, 6);
        statsApiSteps.assertCollectionElementsHasValue(statsEntries, r -> !r.getTimestamp().toString().isBlank(), "timestamp");
        statsApiSteps.assertCollectionElementsHasValue(statsEntries, r -> r.getTotal().intValue() >= 0, "total");
        statsApiSteps.assertCollectionElementsHasValue(statsEntries, r -> r.getActive().intValue() >= 0, "active");
    }
}
