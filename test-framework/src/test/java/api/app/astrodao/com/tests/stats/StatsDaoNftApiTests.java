package api.app.astrodao.com.tests.stats;

import api.app.astrodao.com.core.dto.api.stats.StatsEntries;
import api.app.astrodao.com.openapi.models.StatsEntryDto;
import api.app.astrodao.com.steps.StatsApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import static java.net.HttpURLConnection.HTTP_NOT_FOUND;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("statsApiTests"), @Tag("statsDaoNftApiTests")})
@Epic("Stats")
@Feature("/stats/dao/{id}/nfts API tests")
@DisplayName("/stats/dao/{id}/nfts API tests")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class StatsDaoNftApiTests extends BaseTest {
	private final StatsApiSteps statsApiSteps;

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get list of created NFTs by DAO id")
	@DisplayName("Get list of created NFTs by DAO id")
	void getListOfCreatedNftsByDaoId() {
		String daoId = "gaming.sputnikv2.testnet";

		StatsEntries statsEntries = statsApiSteps.getNFTsForDao(daoId).then()
				.statusCode(HTTP_OK)
				.extract().as(StatsEntries.class);

		statsApiSteps.assertCollectionHasSizeGreaterThanOrEqualTo(statsEntries, 73);

		List<BigDecimal> values1 = statsEntries.stream().map(StatsEntryDto::getValue).filter(bigDecimal -> bigDecimal.equals(BigDecimal.valueOf(0))).collect(Collectors.toList());
		List<BigDecimal> values2 = statsEntries.stream().map(StatsEntryDto::getValue).filter(bigDecimal -> bigDecimal.equals(BigDecimal.valueOf(2))).collect(Collectors.toList());

		statsApiSteps.assertCollectionHasCorrectSize(values1, 2);
		statsApiSteps.assertCollectionHasSizeGreaterThanOrEqualTo(values2, 71);
	}

	@ParameterizedTest
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 404 for DAO NFT stats with invalid daoId")
	@DisplayName("Get HTTP 404 for DAO NFT stats with invalid daoId")
	@CsvSource({"invalidDaoId", "2212332141", "-1", "0",
			"*", "null", "autotest-dao-1.sputnikv2.testnet-1", "another-magic.near"})
	void getHttp404ForDaoNftStatsWithInvalidDaoId(String invalidDaoId) {
		statsApiSteps.getNFTsForDao(invalidDaoId).then()
				.statusCode(HTTP_NOT_FOUND)
				.body("statusCode", equalTo(404),
				      "message", equalTo("Not Found"));
	}
}
