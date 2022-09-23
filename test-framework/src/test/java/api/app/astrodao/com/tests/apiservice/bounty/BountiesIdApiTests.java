package api.app.astrodao.com.tests.apiservice.bounty;

import api.app.astrodao.com.openapi.models.Bounty;
import api.app.astrodao.com.steps.apiservice.BountiesApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;

import static java.net.HttpURLConnection.HTTP_BAD_REQUEST;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("bountiesIdApiTests")})
@Epic("Bounty")
@Feature("/bounties/{id} API tests")
@DisplayName("/bounties/{id} API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class BountiesIdApiTests extends BaseTest {
	private final BountiesApiSteps bountiesApiSteps;

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Getting a bounty by it's ID")
	@DisplayName("Getting a bounty by it's ID")
	void getBountyById() {
		String daoId = "autotest-dao-1.sputnikv2.testnet";
		Integer bountyId = 1;
		String fullBountyId = String.format("%s-%s", daoId, bountyId);

		Bounty response = bountiesApiSteps.getBountyByID(fullBountyId).then()
				.statusCode(HTTP_OK)
				.extract().as(Bounty.class);

		bountiesApiSteps.assertDtoValue(response, Bounty::getDaoId, daoId, "daoId");
		bountiesApiSteps.assertDtoValue(response, p -> p.getBountyId().intValue(), bountyId, "bountyId");
	}

	@ParameterizedTest
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 400 for an invalid bounty")
	@DisplayName("Get HTTP 400 for an invalid bounty")
	@CsvSource({"proposal", "2212332141", "dao-1.sputnikv2.test"})
	void getHttp400ForInvalidBounty(String invalidBountyId) {
		bountiesApiSteps.getBountyByID(invalidBountyId).then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("message", equalTo("Invalid Bounty ID"));
	}
}
