package api.app.astrodao.com.tests.bounty;

import api.app.astrodao.com.openapi.models.BountyContextResponse;
import api.app.astrodao.com.steps.BountiesApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.Map;

@Tags({@Tag("all"), @Tag("bountyContextsTests")})
@Feature("BOUNTY-CONTEXTS API TESTS")
@DisplayName("BOUNTY-CONTEXTS API TESTS")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class BountyContextsTests extends BaseTest {
	private final BountiesApiSteps bountiesApiSteps;

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get a Bounty-contexts as unauthorized user")
	@DisplayName("Get a bounty-contexts as unauthorized user")
	@Description("Get bounty-contexts without 'accountId' parameter - as unauthorized user")
	void getBountyContextsWithoutAccountId() {
		int count = 50;
		int page = 1;
		int total = 1075;
		int pageCount = 22;
		String errorMessage = "Unauthorized user has permission to vote. Should be 'false' but was 'true'. Permission field:";

		ResponseEntity<String> response = bountiesApiSteps.getBountyContexts();
		bountiesApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

		BountyContextResponse bountyContextResponse = bountiesApiSteps.getResponseDto(response,BountyContextResponse.class);

		bountiesApiSteps.assertDtoValue(bountyContextResponse, r -> r.getCount().intValue(), count, "count");
		bountiesApiSteps.assertDtoValue(bountyContextResponse, r -> r.getPage().intValue(), page, "page");
		bountiesApiSteps.assertDtoValueGreaterThanOrEqualTo(bountyContextResponse, r -> r.getTotal().intValue(), total, "total");
		bountiesApiSteps.assertDtoValueGreaterThanOrEqualTo(bountyContextResponse, r -> r.getPageCount().intValue(), pageCount, "pageCount");

		bountiesApiSteps.assertCollectionElementsHasBooleanValueAndSize(bountyContextResponse.getData(),
				bountyContext -> !bountyContext.getProposal().getPermissions().getIsCouncil(),
				errorMessage,
				"isCouncil");

		bountiesApiSteps.assertCollectionElementsHasBooleanValueAndSize(
				bountyContextResponse.getData(),
				bountyContext -> !bountyContext.getProposal().getPermissions().getCanApprove(),
				errorMessage,
				"canApprove");

		bountiesApiSteps.assertCollectionElementsHasBooleanValueAndSize(
				bountyContextResponse.getData(),
				bountyContext -> !bountyContext.getProposal().getPermissions().getCanReject(),
				errorMessage,
				"canReject");

		bountiesApiSteps.assertCollectionElementsHasBooleanValueAndSize(
				bountyContextResponse.getData(),
				bountyContext -> !bountyContext.getProposal().getPermissions().getCanDelete(),
				errorMessage,
				"canDelete");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get a Bounty-contexts with parameters [limit, offset] and sorted by 'createdAt,DESC' as unauthorized user")
	@DisplayName("Get a Bounty-contexts with parameters [limit, offset] and sorted by 'createdAt,DESC' as unauthorized user")
	@Description("Params [limit, offset] = 10. Expected result - Page = 2. Sorted by createdAt,DESC")
	void getBountyContextsWithAccountId() {
		int count = 10;
		int total = 1111;
		int page = 2;
		int pageCount = 112;
		int limit = 10;
		int offset = 10;
		Map<String, Object> queryParams = Map.of(
				"sort", "createdAt,DESC",
				"limit", limit,
				"offset", offset
		);

		ResponseEntity<String> response = bountiesApiSteps.getBountyContextsWithParams(queryParams);
		bountiesApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

		BountyContextResponse bountyContextResponse = bountiesApiSteps.getResponseDto(response,BountyContextResponse.class);

		BigDecimal nearestDate = bountyContextResponse.getData().stream()
				.map(bountyContext -> bountyContext.getProposal().getCreateTimestamp())
				.max(BigDecimal::compareTo).get();

		bountiesApiSteps.assertDtoValue(bountyContextResponse, r -> r.getCount().intValue(), count, "count");
		bountiesApiSteps.assertDtoValue(bountyContextResponse, r -> r.getPage().intValue(), page, "page");
		bountiesApiSteps.assertDtoValueGreaterThanOrEqualTo(bountyContextResponse, r -> r.getTotal().intValue(), total, "total");
		bountiesApiSteps.assertDtoValueGreaterThanOrEqualTo(bountyContextResponse, r -> r.getPageCount().intValue(), pageCount, "pageCount");
		bountiesApiSteps.assertDtoValue(
				bountyContextResponse,
				r -> r.getData().get(0).getProposal().getCreateTimestamp(),
				nearestDate,
				"createdAt");
	}

}
