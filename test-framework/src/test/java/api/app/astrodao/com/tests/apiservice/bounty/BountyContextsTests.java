package api.app.astrodao.com.tests.apiservice.bounty;

import api.app.astrodao.com.openapi.models.BountyContext;
import api.app.astrodao.com.openapi.models.BountyContextResponse;
import api.app.astrodao.com.steps.apiservice.BountiesApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.assertj.core.api.SoftAssertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static java.net.HttpURLConnection.HTTP_BAD_REQUEST;
import static java.net.HttpURLConnection.HTTP_OK;

@Tags({@Tag("all"), @Tag("bountyContextsTests")})
@Epic("Bounty")
@Feature("/bounty-contexts API tests")
@DisplayName("/bounty-contexts API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class BountyContextsTests extends BaseTest {
	private final BountiesApiSteps bountiesApiSteps;

	@Value("${accounts.account1.accountId}")
	private String testAccountId;

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get a Bounty-contexts as unauthorized user")
	@DisplayName("Get a bounty-contexts as unauthorized user")
	@Description("Get bounty-contexts without 'accountId' parameter - as unauthorized user")
	void getBountyContextsWithoutAccountIdParameter() {
		int count = 50;
		int page = 1;
		int total = 1075;
		int pageCount = 22;
		String errorMessage = "Unauthorized user has permission to vote. Should be 'false' but was 'true'. Permission field:";

		BountyContextResponse bountyContextResponse = bountiesApiSteps.getBountyContexts().then()
				.statusCode(HTTP_OK)
				.extract().as(BountyContextResponse.class);

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
				bountyContext -> !bountyContext.getProposal().getPermissions().getCanApprove().toString().isEmpty(),
				"No boolean value for field:", "proposal/permission/canApprove");

		bountiesApiSteps.assertCollectionElementsHasBooleanValueAndSize(
				bountyContextResponse.getData(),
				bountyContext -> !bountyContext.getProposal().getPermissions().getCanReject().toString().isEmpty(),
				"No boolean value for field:", "proposal/permission/canReject");

		bountiesApiSteps.assertCollectionElementsHasBooleanValueAndSize(
				bountyContextResponse.getData(),
				bountyContext -> !bountyContext.getProposal().getPermissions().getCanDelete().toString().isEmpty(),
				"No boolean value for field:", "proposal/permission/canDelete");

		bountiesApiSteps.assertCollectionElementsHasBooleanValueAndSize(
				bountyContextResponse.getData(),
				bountyContext -> !bountyContext.getProposal().getPermissions().getCanAdd().toString().isEmpty(),
				"No boolean value for field:", "proposal/permission/canAdd");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get a Bounty-contexts with parameters [limit, offset] and sorted by 'createdAt,DESC' as unauthorized user")
	@DisplayName("Get a Bounty-contexts with parameters [limit, offset] and sorted by 'createdAt,DESC' as unauthorized user")
	@Description("Params [limit, offset] = 10. Expected result - Page = 2. Sorted by createdAt,DESC")
	void getBountyContextsWithLimitOffsetSortParams() {
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

		BountyContextResponse bountyContextResponse = bountiesApiSteps.getBountyContextsWithParams(queryParams).then()
				.statusCode(HTTP_OK)
				.extract().as(BountyContextResponse.class);

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

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get a Bounty-contexts with [accountId] parameter for existed user")
	@DisplayName("Get a Bounty-contexts with [accountId] parameter for existed user")
	void getBountyContextsWithAccountIdParameter() {
		int count = 50;
		int page = 1;
		int total = 1215;
		int pageCount = 25;
		Map<String, Object> queryParams = Map.of("accountId", testAccountId);

		BountyContextResponse bountyContextResponse = bountiesApiSteps.getBountyContextsWithParams(queryParams).then()
				.statusCode(HTTP_OK)
				.extract().as(BountyContextResponse.class);

		bountiesApiSteps.assertDtoValue(bountyContextResponse, r -> r.getCount().intValue(), count, "count");
		bountiesApiSteps.assertDtoValue(bountyContextResponse, r -> r.getPage().intValue(), page, "page");
		bountiesApiSteps.assertDtoValueGreaterThanOrEqualTo(bountyContextResponse, r -> r.getTotal().intValue(), total, "total");
		bountiesApiSteps.assertDtoValueGreaterThanOrEqualTo(bountyContextResponse, r -> r.getPageCount().intValue(), pageCount, "pageCount");

		List<Boolean> listOfIsCouncil = bountyContextResponse.getData().stream()
				.map(bountyContext -> bountyContext.getProposal().getPermissions().getIsCouncil()).collect(Collectors.toList());

		List<Boolean> listOfCanApprove = bountyContextResponse.getData().stream()
				.map(bountyContext -> bountyContext.getProposal().getPermissions().getCanApprove()).collect(Collectors.toList());

		List<Boolean> listOfCanReject = bountyContextResponse.getData().stream()
				.map(bountyContext -> bountyContext.getProposal().getPermissions().getCanReject()).collect(Collectors.toList());

		List<Boolean> listOfCanDelete = bountyContextResponse.getData().stream()
				.map(bountyContext -> bountyContext.getProposal().getPermissions().getCanDelete()).collect(Collectors.toList());

		SoftAssertions
				.assertSoftly(
						softly -> {
							softly.assertThat(listOfIsCouncil)
									.describedAs("Should have 'true' value for 'isCouncil' parameter in response body")
									.contains(true);
							softly.assertThat(listOfCanApprove)
									.describedAs("Should have 'true' value for 'canApprove' parameter in response body")
									.contains(true);
							softly.assertThat(listOfCanReject)
									.describedAs("Should have 'true' value for 'canReject' parameter in response body")
									.contains(true);
							softly.assertThat(listOfCanDelete)
									.describedAs("Should have 'true' value for 'canReject' parameter in response body")
									.contains(true);
						});
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get a Bounty-contexts with [accountId, page, fields, limit] parameter for existed user")
	@DisplayName("Get a Bounty-contexts with [accountId, page, fields, limit] parameter for existed user")
	void getBountyContextsWithAccountIdPageFieldsLimitParameters() {
		int count = 10;
		int page = 2;
		int total = 1224;
		int pageCount = 123;
		Map<String, Object> queryParams = Map.of(
				"accountId", testAccountId,
				"limit", count,
				"page", page,
				"fields", "proposal,createdAt");

		BountyContextResponse bountyContextResponse = bountiesApiSteps.getBountyContextsWithParams(queryParams).then()
				.statusCode(HTTP_OK)
				.extract().as(BountyContextResponse.class);

		bountiesApiSteps.assertDtoValue(bountyContextResponse, r -> r.getCount().intValue(), count, "count");
		bountiesApiSteps.assertDtoValue(bountyContextResponse, r -> r.getPage().intValue(), page, "page");
		bountiesApiSteps.assertDtoValueGreaterThanOrEqualTo(bountyContextResponse, r -> r.getTotal().intValue(), total, "total");
		bountiesApiSteps.assertDtoValueGreaterThanOrEqualTo(bountyContextResponse, r -> r.getPageCount().intValue(), pageCount, "pageCount");
		bountiesApiSteps.assertCollectionElementsHasValue(bountyContextResponse.getData(), r -> r.getProposal() != null, "proposal");
		bountiesApiSteps.assertCollectionElementsHasValue(bountyContextResponse.getData(), r -> r.getCreatedAt() != null, "createdAt");
		bountiesApiSteps.assertCollectionElementsHasValue(bountyContextResponse.getData(), r -> r.getId() != null, "id");
		bountiesApiSteps.assertCollectionElementsHasNoValue(bountyContextResponse.getData(), r -> r.getIsArchived() == null, "isArchived");
		bountiesApiSteps.assertCollectionElementsHasNoValue(bountyContextResponse.getData(), r -> r.getUpdatedAt() == null, "updatedAt");
		bountiesApiSteps.assertCollectionElementsHasNoValue(bountyContextResponse.getData(), r -> r.getDaoId() == null, "daoId");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get a Bounty-contexts with [accountId, s] parameter for existed user")
	@DisplayName("Get a Bounty-contexts with [accountId, s] parameter for existed user")
	void getBountyContextsWithAccountIdAndSearchParameters() {
		String id = "test-dao-1641395769436.sputnikv2.testnet-1823";
		String daoId = "test-dao-1641395769436.sputnikv2.testnet";
		int count = 1;
		int total = 1;
		int page = 1;
		int pageCount = 1;
		Map<String, Object> queryParams = Map.of(
				"accountId", testAccountId,
				"s", String.format("{\"id\": \"%s\"}", id));

		BountyContextResponse bountyContextResponse = bountiesApiSteps.getBountyContextsWithParams(queryParams).then()
				.statusCode(HTTP_OK)
				.extract().as(BountyContextResponse.class);

		bountiesApiSteps.assertDtoValue(bountyContextResponse, r -> r.getCount().intValue(), count, "count");
		bountiesApiSteps.assertDtoValue(bountyContextResponse, r -> r.getTotal().intValue(), total, "total");
		bountiesApiSteps.assertDtoValue(bountyContextResponse, r -> r.getPage().intValue(), page, "page");
		bountiesApiSteps.assertDtoValue(bountyContextResponse, r -> r.getPageCount().intValue(), pageCount, "pageCount");
		bountiesApiSteps.assertCollectionContainsOnly(bountyContextResponse.getData(), BountyContext::getId, id, "id");
		bountiesApiSteps.assertCollectionContainsOnly(bountyContextResponse.getData(), BountyContext::getDaoId, daoId, "id");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get a Bounty-contexts with [accountId, filter] parameter for existed user")
	@DisplayName("Get a Bounty-contexts with [accountId, filter] parameter for existed user")
	void getBountyContextsWithAccountIdAndFilterParameters() {
		String daoId = "twp-dao.sputnikv2.testnet";
		int count = 6;
		int total = 6;
		int page = 1;
		int pageCount = 1;
		Map<String, Object> queryParams = Map.of(
				"accountId", testAccountId,
				"filter", "daoId||$eq||" + daoId);

		BountyContextResponse bountyContextResponse = bountiesApiSteps.getBountyContextsWithParams(queryParams).then()
				.statusCode(HTTP_OK)
				.extract().as(BountyContextResponse.class);

		bountiesApiSteps.assertDtoValue(bountyContextResponse, r -> r.getCount().intValue(), count, "count");
		bountiesApiSteps.assertDtoValue(bountyContextResponse, r -> r.getTotal().intValue(), total, "total");
		bountiesApiSteps.assertDtoValue(bountyContextResponse, r -> r.getPage().intValue(), page, "page");
		bountiesApiSteps.assertDtoValue(bountyContextResponse, r -> r.getPageCount().intValue(), pageCount, "pageCount");
		bountiesApiSteps.assertCollectionContainsOnly(bountyContextResponse.getData(), BountyContext::getDaoId, daoId, "id");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get a Bounty-contexts with [accountId, filter, or] parameter for existed user")
	@DisplayName("Get a Bounty-contexts with [accountId, filter, or] parameter for existed user")
	void getBountyContextsWithAccountIdFilterOrParameters() {
		String daoId1 = "rs-dao-1.sputnikv2.testnet";
		String daoId2 = "twp-dao.sputnikv2.testnet";
		int count = 16;
		int total = 16;
		int page = 1;
		int pageCount = 1;
		Map<String, Object> queryParams = Map.of(
				"accountId", testAccountId,
				"filter", "daoId||$eq||" + daoId1,
				"or", "daoId||$eq||" + daoId2
		);

		BountyContextResponse bountyContextResponse = bountiesApiSteps.getBountyContextsWithParams(queryParams).then()
				.statusCode(HTTP_OK)
				.extract().as(BountyContextResponse.class);

		bountiesApiSteps.assertDtoValue(bountyContextResponse, r -> r.getCount().intValue(), count, "count");
		bountiesApiSteps.assertDtoValue(bountyContextResponse, r -> r.getTotal().intValue(), total, "total");
		bountiesApiSteps.assertDtoValue(bountyContextResponse, r -> r.getPage().intValue(), page, "page");
		bountiesApiSteps.assertDtoValue(bountyContextResponse, r -> r.getPageCount().intValue(), pageCount, "pageCount");

		long numberOfDaoIds1 = bountyContextResponse.getData().stream().map(BountyContext::getDaoId).filter(daoId -> daoId.equals(daoId1)).count();
		long numberOfDaoIds2 = bountyContextResponse.getData().stream().map(BountyContext::getDaoId).filter(daoId -> daoId.equals(daoId2)).count();

		SoftAssertions
				.assertSoftly(
						softly -> {
							softly.assertThat(numberOfDaoIds1)
									.describedAs("Number of daoIds '%s' in Bounty-contexts response", daoId1)
									.isEqualTo(10);
							softly.assertThat(numberOfDaoIds2)
									.describedAs("Number of daoIds '%s' in Bounty-contexts response", daoId2)
									.isEqualTo(6);
						});
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 400 for Bounty-contexts")
	@DisplayName("Get HTTP 400 for Bounty-contexts")
	void getHttp400ForBountyContexts() {
		Map<String, Object> queryParams = Map.of(
				"sort", "createdAt,DESC",
				"limit", 50,
				"offset", 0,
				"page", 1,
				"fields", "daoId,createdAt",
				"s", "Invalid search request");

		bountiesApiSteps.getBountyContextsWithParams(queryParams).then().statusCode(HTTP_BAD_REQUEST);
	}
}