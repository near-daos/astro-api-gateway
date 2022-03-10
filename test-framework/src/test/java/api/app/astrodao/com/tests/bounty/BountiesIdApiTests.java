package api.app.astrodao.com.tests.bounty;

import api.app.astrodao.com.openapi.models.Bounty;
import api.app.astrodao.com.steps.BountiesApiSteps;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@Tags({@Tag("all"), @Tag("bountiesIdApiTests")})
@Epic("Bounty")
@Feature("/bounties/{id} API tests")
@DisplayName("/bounties/{id} API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class BountiesIdApiTests {
	private final BountiesApiSteps bountiesApiSteps;

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Getting a bounty by it's ID")
	@DisplayName("Getting a bounty by it's ID")
	void getBountyById() {
		String daoId = "autotest-dao-1.sputnikv2.testnet";
		Integer bountyId = 1;
		String fullBountyId = String.format("%s-%s", daoId, bountyId);
		ResponseEntity<String> response = bountiesApiSteps.getBountyByID(fullBountyId);
		bountiesApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

		Bounty bountyResponse = bountiesApiSteps.getResponseDto(response, Bounty.class);

		bountiesApiSteps.assertDtoValue(bountyResponse, Bounty::getDaoId, daoId, "daoId");
		bountiesApiSteps.assertDtoValue(bountyResponse, p -> p.getBountyId().intValue(), bountyId, "bountyId");
	}
}
