package api.app.astrodao.com.tests.proposals;

import api.app.astrodao.com.core.dto.api.proposals.ProposalDto;
import api.app.astrodao.com.core.dto.api.proposals.ProposalResponse;
import api.app.astrodao.com.steps.ProposalsApiSteps;
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
import org.springframework.beans.factory.annotation.Value;

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static java.net.HttpURLConnection.*;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("proposalsAccountProposalsAccountIdApiTests")})
@Epic("Proposals")
@Feature("/proposals/account-proposals/{accountId} API tests")
@DisplayName("/proposals/account-proposals/{accountId} API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class ProposalsAccountProposalsAccountIdApiTests extends BaseTest {
	private final ProposalsApiSteps proposalsApiSteps;

	@Value("${accounts.account1.accountId}")
	private String account1Id;


	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get account proposals by 'accountId' param")
	@DisplayName("User should be able to get account proposals by 'accountId' param")
	void getAccountProposalsByAccountIdParam() {
		int count = 50;

		ProposalResponse proposalResponse = proposalsApiSteps.getAccountProposalsByAccountId(account1Id).then()
				.statusCode(HTTP_OK)
				.extract().as(ProposalResponse.class);

		proposalsApiSteps.assertDtoValue(proposalResponse, r -> r.getCount().intValue(), count, "count");
		proposalsApiSteps.assertDtoValueGreaterThanOrEqualTo(proposalResponse, r -> r.getTotal().intValue(), 6726, "total");
		proposalsApiSteps.assertDtoValue(proposalResponse, r -> r.getPage().intValue(), 1, "page");
		proposalsApiSteps.assertDtoValueGreaterThan(proposalResponse, r -> r.getPageCount().intValue(), 134, "pageCount");
		proposalsApiSteps.assertCollectionHasCorrectSize(proposalResponse.getData(), 50);

		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getCreatedAt() != null, "data/createdAt");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getUpdatedAt() != null, "data/updatedAt");
		proposalsApiSteps.assertCollectionHasExpectedSize(proposalResponse.getData(), ProposalDto::getTransactionHash, count, "data/transactionHash");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getId().contains(".sputnikv2.testnet-"), "data/id");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getProposalId() >= 0, "data/proposalId");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getDaoId().endsWith(".sputnikv2.testnet"), "data/daoId");
		proposalsApiSteps.assertCollectionContainsOnly(proposalResponse.getData(), ProposalDto::getProposer, account1Id, "data/proposer");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> !r.getDescription().isEmpty(), "data/description");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getStatus() != null, "data/status");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVoteStatus() != null, "data/voteStatus");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getKind() != null, "data/kind");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVotes() != null, "data/votes");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVotePeriodEnd() != null, "data/votePeriodEnd");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getDao() != null, "data/dao");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getActions() != null, "data/actions");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getCommentsCount() >= 0, "data/commentsCount");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getPermissions() != null, "data/permissions");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get account proposals by 'accountId' with query params: [sort, limit, offset, page]")
	@DisplayName("User should be able to get account proposals by 'accountId' with query params: [sort, limit, offset, page]")
	void getAccountProposalsByAccountIdWithSortLimitOffsetPageParams() {
		int limit = 10;
		int page = 10;
		Map<String, Object> query = Map.of(
				"sort","createdAt,DESC",
				"limit", limit,
				"offset", 100,
				"page", page
		);

		ProposalResponse proposalResponse = proposalsApiSteps.getAccountProposals(query, account1Id).then()
				.statusCode(HTTP_OK)
				.extract().as(ProposalResponse.class);

		proposalsApiSteps.assertDtoValue(proposalResponse, r -> r.getCount().intValue(), limit, "count");
		proposalsApiSteps.assertDtoValueGreaterThanOrEqualTo(proposalResponse, r -> r.getTotal().intValue(), 6726, "total");
		proposalsApiSteps.assertDtoValue(proposalResponse, r -> r.getPage().intValue(), page, "page");
		proposalsApiSteps.assertDtoValueGreaterThan(proposalResponse, r -> r.getPageCount().intValue(), 672, "pageCount");
		proposalsApiSteps.assertCollectionHasCorrectSize(proposalResponse.getData(), limit);

		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getCreatedAt() != null, "data/createdAt");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getUpdatedAt() != null, "data/updatedAt");
		proposalsApiSteps.assertCollectionHasExpectedSize(proposalResponse.getData(), ProposalDto::getTransactionHash, limit, "data/transactionHash");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getId().contains(".sputnikv2.testnet-"), "data/id");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getProposalId() >= 0, "data/proposalId");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getDaoId().endsWith(".sputnikv2.testnet"), "data/daoId");
		proposalsApiSteps.assertCollectionContainsOnly(proposalResponse.getData(), ProposalDto::getProposer, account1Id, "data/proposer");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> !r.getDescription().isEmpty(), "data/description");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getStatus() != null, "data/status");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVoteStatus() != null, "data/voteStatus");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getKind() != null, "data/kind");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVotes() != null, "data/votes");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVotePeriodEnd() != null, "data/votePeriodEnd");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getDao() != null, "data/dao");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getActions() != null, "data/actions");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getCommentsCount() >= 0, "data/commentsCount");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getPermissions() != null, "data/permissions");

		List<OffsetDateTime> createdAtList = proposalResponse.getData().stream().map(ProposalDto::getCreatedAt).collect(Collectors.toList());
		proposalsApiSteps.assertOffsetDateTimesAreSortedCorrectly(createdAtList, Comparator.reverseOrder(),
		                                                         "Account proposals should be sorted by createdAt in DESC order");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get account proposals by 'accountId' with query params: [limit, sort, s]")
	@DisplayName("User should be able to get account proposals by 'accountId' with query params: [limit, sort, s]")
	void getListOfAccountProposalsWithLimitSortAndSParams() {
		int limit = 10;
		String type = "Vote";
		Map<String, Object> query = Map.of(
				"limit", limit,
				"sort","createdAt,DESC",
				"s", String.format("{\"type\": \"%s\"}", type)
		);

		ProposalResponse proposalResponse = proposalsApiSteps.getAccountProposals(query, account1Id).then()
				.statusCode(HTTP_OK)
				.extract().as(ProposalResponse.class);

		proposalsApiSteps.assertDtoValue(proposalResponse, r -> r.getCount().intValue(), limit, "count");
		proposalsApiSteps.assertDtoValueGreaterThan(proposalResponse, r -> r.getTotal().intValue(), 2065, "total");
		proposalsApiSteps.assertDtoValue(proposalResponse, r -> r.getPage().intValue(), 1, "page");
		proposalsApiSteps.assertDtoValueGreaterThan(proposalResponse, r -> r.getPageCount().intValue(), 206, "pageCount");
		proposalsApiSteps.assertCollectionHasCorrectSize(proposalResponse.getData(), limit);

		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getCreatedAt() != null, "data/createdAt");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getUpdatedAt() != null, "data/updatedAt");
		proposalsApiSteps.assertCollectionHasExpectedSize(proposalResponse.getData(), ProposalDto::getTransactionHash, limit, "data/transactionHash");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getId().contains(".sputnikv2.testnet-"), "data/id");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getProposalId() >= 0, "data/proposalId");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getDaoId().endsWith(".sputnikv2.testnet"), "data/daoId");
		proposalsApiSteps.assertCollectionContainsOnly(proposalResponse.getData(), ProposalDto::getProposer, account1Id, "data/proposer");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> !r.getDescription().isEmpty(), "data/description");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getStatus() != null, "data/status");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVoteStatus() != null, "data/voteStatus");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getKind() != null, "data/kind");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getType().equals(type), "data/type");
		proposalsApiSteps.assertCollectionContainsOnly(proposalResponse.getData(), proposalDto -> proposalDto.getKind().getType(), type, "data/kind/type");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVotes() != null, "data/votes");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVotePeriodEnd() != null, "data/votePeriodEnd");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getDao() != null, "data/dao");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getActions() != null, "data/actions");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getCommentsCount() >= 0, "data/commentsCount");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getPermissions() != null, "data/permissions");

		List<OffsetDateTime> createdAtList = proposalResponse.getData().stream().map(ProposalDto::getCreatedAt).collect(Collectors.toList());
		proposalsApiSteps.assertOffsetDateTimesAreSortedCorrectly(createdAtList, Comparator.reverseOrder(),
		                                                          "Account proposals should be sorted by createdAt in DESC order");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get account proposals by 'accountId' with query params: [sort, fields, offset, s]")
	@DisplayName("User should be able to get account proposals by 'accountId' with query params: [sort, fields, offset, s]")
	void getListOfAccountProposalsWithOffsetSortFieldsSParams() {
		int count = 50;
		String type = "ChangePolicy";
		Map<String, Object> query = Map.of(
				"sort","createdAt,DESC",
				"offset", 50,
				"s", String.format("{\"type\": \"%s\"}", type),
				"fields", "createdAt,id,kind,description,type"
		);

		ProposalResponse proposalResponse = proposalsApiSteps.getAccountProposals(query, account1Id).then()
				.statusCode(HTTP_OK)
				.extract().as(ProposalResponse.class);

		proposalsApiSteps.assertDtoValue(proposalResponse, r -> r.getCount().intValue(), count, "count");
		proposalsApiSteps.assertDtoValueGreaterThanOrEqualTo(proposalResponse, r -> r.getTotal().intValue(), 1491, "total");
		proposalsApiSteps.assertDtoValue(proposalResponse, r -> r.getPage().intValue(), 2, "page");
		proposalsApiSteps.assertDtoValueGreaterThanOrEqualTo(proposalResponse, r -> r.getPageCount().intValue(), 30, "pageCount");
		proposalsApiSteps.assertCollectionHasCorrectSize(proposalResponse.getData(), count);

		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getCreatedAt() != null, "data/createdAt");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getId().contains(".sputnikv2.testnet-"), "data/id");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> !r.getDescription().isEmpty(), "data/description");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getKind() != null, "data/kind");
		proposalsApiSteps.assertCollectionContainsOnly(proposalResponse.getData(), proposalDto -> proposalDto.getKind().getType(), type, "data/kind/type");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getType().equals(type), "data/type");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getDao() != null, "data/dao");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getActions() != null, "data/actions");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getCommentsCount() >= 0, "data/commentsCount");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getPermissions() != null, "data/permissions");

		proposalsApiSteps.assertCollectionElementsHasNoValue(proposalResponse.getData(), r -> r.getUpdatedAt() == null, "data/updatedAt");
		proposalsApiSteps.assertCollectionHasExpectedSize(proposalResponse.getData(), ProposalDto::getTransactionHash, count, "data/transactionHash");
		proposalsApiSteps.assertCollectionElementsHasNoValue(proposalResponse.getData(), r -> r.getProposalId() == null, "data/proposalId");
		proposalsApiSteps.assertCollectionElementsHasNoValue(proposalResponse.getData(), r -> r.getDaoId() == null, "data/daoId");
		proposalsApiSteps.assertCollectionElementsHasNoValue(proposalResponse.getData(), r -> r.getProposer() == null, "data/proposer");
		proposalsApiSteps.assertCollectionElementsHasNoValue(proposalResponse.getData(), r -> r.getStatus() == null, "data/status");
		proposalsApiSteps.assertCollectionElementsHasNoValue(proposalResponse.getData(), r -> r.getVoteStatus() == null, "data/voteStatus");
		proposalsApiSteps.assertCollectionElementsHasNoValue(proposalResponse.getData(), r -> r.getVotes() == null, "data/votes");
		proposalsApiSteps.assertCollectionElementsHasNoValue(proposalResponse.getData(), r -> r.getVotePeriodEnd() == null, "data/votePeriodEnd");

		List<OffsetDateTime> createdAtList = proposalResponse.getData().stream().map(ProposalDto::getCreatedAt).collect(Collectors.toList());
		proposalsApiSteps.assertOffsetDateTimesAreSortedCorrectly(createdAtList, Comparator.reverseOrder(),
		                                                          "Account proposals should be sorted by createdAt in DESC order");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get account proposals by 'accountId' with query params: [filter, or]")
	@DisplayName("User should be able to get account proposals by 'accountId' with query params: [filter, or]")
	void getListOfAccountProposalsWithFilterAndOrParameters() {
		String type1 = "Transfer";
		String type2 = "AddBounty";
		int count = 50;
		Map<String, Object> query = Map.of(
				"filter", "type||$eq||" + type1,
				"or", "type||$eq||" + type2
		);

		ProposalResponse proposalResponse = proposalsApiSteps.getAccountProposals(query, account1Id).then()
				.statusCode(HTTP_OK)
				.extract().as(ProposalResponse.class);

		proposalsApiSteps.assertDtoValueGreaterThan(proposalResponse, r -> r.getTotal().intValue(), count, "total");
		proposalsApiSteps.assertDtoValueGreaterThan(proposalResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
		proposalsApiSteps.assertDtoValue(proposalResponse, r -> r.getPage().intValue(), 1, "page");
		proposalsApiSteps.assertDtoValue(proposalResponse, r -> r.getCount().intValue(), count, "count");
		proposalsApiSteps.assertCollectionHasCorrectSize(proposalResponse.getData(), count);
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getCreatedAt() != null, "data/createdAt");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getUpdatedAt() != null, "data/updatedAt");
		proposalsApiSteps.assertCollectionHasExpectedSize(proposalResponse.getData(), ProposalDto::getTransactionHash, count, "data/transactionHash");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getId().contains(".sputnikv2.testnet-"), "data/id");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getProposalId() >= 0, "data/proposalId");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getDaoId().endsWith(".sputnikv2.testnet"), "data/daoId");
		proposalsApiSteps.assertCollectionContainsOnly(proposalResponse.getData(), ProposalDto::getProposer, account1Id, "data/proposer");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> !r.getDescription().isEmpty(), "data/description");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getStatus() != null, "data/status");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVoteStatus() != null, "data/voteStatus");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getKind() != null, "data/kind");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVotes() != null, "data/votes");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVotePeriodEnd() != null, "data/votePeriodEnd");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getDao() != null, "data/dao");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getActions() != null, "data/actions");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getCommentsCount() >= 0, "data/commentsCount");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getPermissions() != null, "data/permissions");
		proposalsApiSteps.assertCollectionContainsExactlyInAnyOrder(proposalResponse.getData(), ProposalDto::getType, type1, type2);
		proposalsApiSteps.assertCollectionContainsExactlyInAnyOrder(proposalResponse.getData(), proposalDto -> proposalDto.getKind().getType(), type1, type2);
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get account proposals by 'accountId' with query params: [voted=true]")
	@DisplayName("User should be able to get account proposals by 'accountId' with query params: [voted=true]")
	void getListOfAccountProposalsWithVotedTrueParam() {
		int count = 50;
		Map<String, Object> query = Map.of(
				"voted","true"
		);

		ProposalResponse proposalResponse = proposalsApiSteps.getAccountProposals(query, account1Id).then()
				.statusCode(HTTP_OK)
				.extract().as(ProposalResponse.class);

		proposalsApiSteps.assertDtoValueGreaterThan(proposalResponse, r -> r.getTotal().intValue(), count, "total");
		proposalsApiSteps.assertDtoValueGreaterThan(proposalResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
		proposalsApiSteps.assertDtoValue(proposalResponse, r -> r.getPage().intValue(), 1, "page");
		proposalsApiSteps.assertDtoValue(proposalResponse, r -> r.getCount().intValue(), count, "count");
		proposalsApiSteps.assertCollectionHasCorrectSize(proposalResponse.getData(), count);

		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getCreatedAt() != null, "data/createdAt");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getUpdatedAt() != null, "data/updatedAt");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getTransactionHash() != null, "data/transactionHash");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getId().contains(".sputnikv2.testnet-"), "data/id");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getProposalId() >= 0, "data/proposalId");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getDaoId().endsWith(".sputnikv2.testnet"), "data/daoId");
		proposalsApiSteps.assertCollectionContainsOnly(proposalResponse.getData(), ProposalDto::getProposer, account1Id, "data/proposer");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> !r.getDescription().isEmpty(), "data/description");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getStatus() != null, "data/status");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVoteStatus() != null, "data/voteStatus");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getKind() != null, "data/kind");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVotes().keySet().stream().allMatch(p -> p.equals(account1Id)), "data/votes");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVotePeriodEnd() != null, "data/votePeriodEnd");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getDao() != null, "data/dao");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getActions() != null, "data/actions");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getCommentsCount() >= 0, "data/commentsCount");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getPermissions() != null, "data/permissions");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get account proposals by 'accountId' with query params: [voted=false]")
	@DisplayName("User should be able to get account proposals by 'accountId' with query params: [voted=false]")
	void getListOfAccountProposalsWithVotedFalseParam() {
		int count = 50;
		Map<String, Object> query = Map.of(
				"voted","false"
		);

		ProposalResponse proposalResponse = proposalsApiSteps.getAccountProposals(query, account1Id).then()
				.statusCode(HTTP_OK)
				.extract().as(ProposalResponse.class);

		proposalsApiSteps.assertDtoValueGreaterThan(proposalResponse, r -> r.getTotal().intValue(), count, "total");
		proposalsApiSteps.assertDtoValueGreaterThan(proposalResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
		proposalsApiSteps.assertDtoValue(proposalResponse, r -> r.getPage().intValue(), 1, "page");
		proposalsApiSteps.assertDtoValue(proposalResponse, r -> r.getCount().intValue(), count, "count");
		proposalsApiSteps.assertCollectionHasCorrectSize(proposalResponse.getData(), count);

		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getCreatedAt() != null, "data/createdAt");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getUpdatedAt() != null, "data/updatedAt");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getTransactionHash() != null, "data/transactionHash");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getId().contains(".sputnikv2.testnet-"), "data/id");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getProposalId() >= 0, "data/proposalId");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getDaoId().endsWith(".sputnikv2.testnet"), "data/daoId");
		proposalsApiSteps.assertCollectionContainsOnly(proposalResponse.getData(), ProposalDto::getProposer, account1Id, "data/proposer");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> !r.getDescription().isEmpty(), "data/description");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getStatus() != null, "data/status");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVoteStatus() != null, "data/voteStatus");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getKind() != null, "data/kind");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVotes().isEmpty(), "data/votes");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVotePeriodEnd() != null, "data/votePeriodEnd");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getDao() != null, "data/dao");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getActions() != null, "data/actions");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getCommentsCount() >= 0, "data/commentsCount");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getPermissions() != null, "data/permissions");
	}

	@ParameterizedTest
	@CsvSource(value = {
			"sort; createdAt,DES; Invalid sort order. ASC,DESC expected",
			"limit; -50; LIMIT must not be negative",
			"offset; -5; OFFSET must not be negative",
			"page; -2; PAGE must not be negative",
			"s; query; Invalid search param. JSON expected",
			"fields; ids; id field is required",
			"fields; id; kind field is required",
			"fields; id,kind; createdAt field is required",
			"filter; string; Invalid filter value",
			"or; null; Invalid or value",
	}, delimiter = 59)
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 400 status code for account proposals with 'accountId' param")
	@DisplayName("Get HTTP 400 status code for account proposals with 'accountId' param")
	void getHttp400StatusCodeForAccountProposalsWithAccountIdParam(String key, String value, String errorMsg) {
		Map<String, Object> query = Map.of(key, value);

		proposalsApiSteps.getAccountProposals(query, account1Id).then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo(errorMsg));
	}

	@ParameterizedTest
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 404 for account proposals with invalid 'accountId' param")
	@DisplayName("Get HTTP 404 for account proposals with invalid 'accountId' param")
	@CsvSource({"invalidAccountId", "2212332141", "-1", "0", "testdao3132498.testnet",
			"*", "autotest-dao-1.sputnikv2.testnet-1", "another-magic.near"})
	void getHttp404ForAccountProposalsWithInvalidAccountId(String accountIdParam) {
		String errorMessage = String.format("Account does not exist: %s", accountIdParam);

		proposalsApiSteps.getAccountProposalsByAccountId(accountIdParam).then()
				.statusCode(HTTP_NOT_FOUND)
				.body("statusCode", equalTo(HTTP_NOT_FOUND),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Not Found"));
	}
}
