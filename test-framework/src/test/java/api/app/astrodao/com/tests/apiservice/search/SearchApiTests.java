package api.app.astrodao.com.tests.apiservice.search;

import api.app.astrodao.com.openapi.models.DaoResponseV1;
import api.app.astrodao.com.openapi.models.Proposal;
import api.app.astrodao.com.openapi.models.SearchResultDto;
import api.app.astrodao.com.openapi.models.VotePolicy;
import api.app.astrodao.com.steps.apiservice.SearchApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static java.net.HttpURLConnection.HTTP_BAD_REQUEST;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.hamcrest.Matchers.hasItem;

@Tags({@Tag("all"), @Tag("searchApiTests")})
@Epic("Search")
@Feature("/search API tests")
@DisplayName("/search API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class SearchApiTests extends BaseTest {
    private final SearchApiSteps searchApiSteps;

    @Value("${accounts.account1.accountId}")
    private String account1Id;


    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Performing search with query param: [limit, offset, page]")
    @DisplayName("Performing search with query param: [limit, offset, page]")
    void performingSearchWithLimitOffsetPageParams() {
        int page = 2;
        int count = 5;
        Map<String, Object> query = Map.of(
                "query", "test-dao",
                "limit", count,
                "offset", 5,
                "page", page
        );

        SearchResultDto searchResult = searchApiSteps.search(query).then()
                .statusCode(HTTP_OK)
                .extract().as(SearchResultDto.class);

        searchApiSteps.assertDtoValue(searchResult, r -> r.getDaos().getPage().intValue(), page, "daos/page");
        searchApiSteps.assertDtoValueGreaterThan(searchResult, r -> r.getDaos().getPageCount().intValue(), 310, "daos/pageCount");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getDaos().getCount().intValue(), count, "daos/count");
        searchApiSteps.assertDtoValueGreaterThan(searchResult, r -> r.getDaos().getTotal().intValue(), 1553, "daos/total");


        searchApiSteps.assertDtoValue(searchResult, r -> r.getProposals().getCount().intValue(), count, "proposals/count");
        searchApiSteps.assertDtoValueGreaterThan(searchResult, r -> r.getProposals().getTotal().intValue(), 8070, "proposals/total");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getProposals().getPage().intValue(), page, "proposals/page");
        searchApiSteps.assertDtoValueGreaterThan(searchResult, r -> r.getProposals().getPageCount().intValue(), 1614, "proposals/pageCount");

        searchApiSteps.assertDtoValue(searchResult, r -> r.getMembers().getCount().intValue(), 0, "members/count");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getMembers().getTotal().intValue(), 1, "members/total");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getMembers().getPage().intValue(), page, "members/page");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getMembers().getPageCount().intValue(), 1, "members/pageCount");
    }

    @Test
    @Severity(SeverityLevel.NORMAL)
    @Story("Get HTTP 400 for a Search")
    @DisplayName("Get HTTP 400 for a Search")
    void getHttp400ForSearch() {
        int limit = 50;
        int offset = 1;
        int page = 1;
        Map<String, Object> queryParams = Map.of(
                "limit", limit,
                "offset", offset,
                "page", page
        );

        searchApiSteps.search(queryParams).then()
                .statusCode(HTTP_BAD_REQUEST)
                .body("message", hasItem("query must be a string"));
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Performing search with query param: [query, accountId]")
    @DisplayName("Performing search with query param: [query, accountId]")
    void performingSearchWithQueryAccountIdParams() {
        int page = 1;
        int pageCount = 1;
        int count = 1;
        int total = 1;
        String daoId = "testdao1.sputnikv2.testnet";

        Map<String, Object> query = Map.of(
                "query", daoId,
                "accountId", account1Id
        );

        SearchResultDto searchResult = searchApiSteps.search(query).then()
                .statusCode(HTTP_OK)
                .extract().as(SearchResultDto.class);

        searchApiSteps.assertDtoValue(searchResult, r -> r.getDaos().getCount().intValue(), count, "daos/count");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getDaos().getTotal().intValue(), total, "daos/total");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getDaos().getPage().intValue(), page, "daos/page");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getDaos().getPageCount().intValue(), pageCount, "daos/pageCount");

        searchApiSteps.assertCollectionElementsHasValue(searchResult.getDaos().getData(), dao -> !dao.getCreatedAt().toString().isEmpty(), "daos/data/createdAt");
        searchApiSteps.assertCollectionContainsOnly(searchResult.getDaos().getData(), DaoResponseV1::getTransactionHash, "3tiZ57cpZjPc7Lr8yVZznkb63MgVSzf6JSc97dpDJbkx", "daos/data/transactionHash");
        searchApiSteps.assertCollectionContainsOnly(searchResult.getDaos().getData(), DaoResponseV1::getId, daoId, "id");
        searchApiSteps.assertCollectionElementsHasValue(searchResult.getDaos().getData(), dao -> !dao.getConfig().getMetadata().isEmpty(), "daos/data/config/metadata");
        searchApiSteps.assertCollectionElementsHasValue(searchResult.getDaos().getData(), dao -> !dao.getConfig().getName().isEmpty(), "daos/data/config/name");
        searchApiSteps.assertCollectionElementsHasValue(searchResult.getDaos().getData(), dao -> !dao.getConfig().getPurpose().isEmpty(), "daos/data/config/purpose");

        searchApiSteps.assertCollectionContainsOnly(searchResult.getDaos().getData(), dao -> dao.getNumberOfMembers().intValue(), 1, "daos/data/numberOfMembers");
        searchApiSteps.assertCollectionContainsOnly(searchResult.getDaos().getData(), dao -> dao.getNumberOfGroups().intValue(), 1, "daos/data/numberOfGroups");
        searchApiSteps.assertCollectionContainsOnly(searchResult.getDaos().getData(), DaoResponseV1::getAccountIds, List.of(account1Id), "daos/data/accountIds");


        searchApiSteps.assertCollectionElementsHasValue(searchResult.getProposals().getData(), proposal -> !proposal.getCreatedAt().toString().isEmpty(), "proposals/data/createdAt");
        searchApiSteps.assertCollectionElementsHasValue(searchResult.getProposals().getData(), proposal -> !proposal.getUpdatedAt().toString().isEmpty(), "proposals/data/updatedAt");
        searchApiSteps.assertCollectionElementsHasValue(searchResult.getProposals().getData(), proposal -> !proposal.getTransactionHash().isEmpty(), "proposals/data/transactionHash");
        searchApiSteps.assertCollectionElementsHasValue(searchResult.getProposals().getData(), proposal -> !proposal.getId().isEmpty(), "proposals/data/id");
        searchApiSteps.assertCollectionElementsHasValue(searchResult.getProposals().getData(), proposal -> proposal.getProposalId().intValue() >= 0, "proposals/data/proposalId");
        searchApiSteps.assertCollectionContainsOnly(searchResult.getProposals().getData(), Proposal::getDaoId, daoId, "proposals/data/daoId");
        searchApiSteps.assertCollectionContainsOnly(searchResult.getProposals().getData(), Proposal::getProposer, account1Id, "proposals/data/proposer");
        searchApiSteps.assertCollectionElementsHasValue(searchResult.getProposals().getData(), proposal -> !proposal.getDescription().isEmpty(), "proposals/data/description");
        searchApiSteps.assertCollectionElementsHasValue(searchResult.getProposals().getData(), proposal -> !proposal.getStatus().toString().isEmpty(), "proposals/data/status");
        searchApiSteps.assertCollectionElementsHasValue(searchResult.getProposals().getData(), proposal -> !proposal.getVoteStatus().toString().isEmpty(), "proposals/data/voteStatus");
        searchApiSteps.assertCollectionElementsHasValue(searchResult.getProposals().getData(), proposal -> proposal.getKind() != null, "proposals/data/kind");
        searchApiSteps.assertCollectionElementsHasValue(searchResult.getProposals().getData(), proposal -> !proposal.getType().toString().isEmpty(), "proposals/data/type");
        searchApiSteps.assertCollectionElementsHasValue(searchResult.getProposals().getData(), proposal -> proposal.getVotes() != null, "proposals/data/votes");
        searchApiSteps.assertCollectionElementsHasValue(searchResult.getProposals().getData(), proposal -> proposal.getVotePeriodEnd().longValue() > 0, "proposals/data/votePeriodEnd");
        searchApiSteps.assertCollectionContainsOnly(searchResult.getProposals().getData(), Proposal::getCommentsCount, BigDecimal.valueOf(0), "proposals/data/commentsCount");

        searchApiSteps.assertCollectionElementsHasValue(searchResult.getProposals().getData(), proposal -> !proposal.getDao().getTransactionHash().isEmpty(), "proposals/data/dao/transactionHash");
        searchApiSteps.assertCollectionContainsOnly(searchResult.getProposals().getData(), proposal -> proposal.getDao().getId(), daoId, "proposals/data/dao/id");
        searchApiSteps.assertCollectionElementsHasValue(searchResult.getProposals().getData(), proposal -> !proposal.getDao().getConfig().getMetadata().isEmpty(), "proposals/data/dao/config/metadata");
        searchApiSteps.assertCollectionElementsHasValue(searchResult.getProposals().getData(), proposal -> !proposal.getDao().getConfig().getName().isEmpty(), "proposals/data/dao/config/name");
        searchApiSteps.assertCollectionElementsHasValue(searchResult.getProposals().getData(), proposal -> !proposal.getDao().getConfig().getPurpose().isEmpty(), "proposals/data/dao/config/purpose");

        searchApiSteps.assertCollectionElementsHasValue(searchResult.getProposals().getData(), proposal -> proposal.getDao().getNumberOfMembers().intValue() > 0, "proposals/data/dao/numberOfMembers");
        searchApiSteps.assertCollectionContainsOnly(searchResult.getProposals().getData(), proposal -> proposal.getDao().getPolicy().getDaoId(), daoId, "proposals/data/dao/policy/id");
        searchApiSteps.assertCollectionContainsOnly(searchResult.getProposals().getData(), proposal -> proposal.getDao().getPolicy().getDefaultVotePolicy().getWeightKind(), VotePolicy.WeightKindEnum.ROLEWEIGHT, "proposals/data/dao/policy/defaultVotePolicy/weightKind");
        searchApiSteps.assertCollectionElementsHasValue(searchResult.getProposals().getData(), proposal -> proposal.getDao().getPolicy().getDefaultVotePolicy().getQuorum().intValue() >= 0, "proposals/data/dao/policy/defaultVotePolicy/quorum");
        searchApiSteps.assertCollectionElementsHasValue(searchResult.getProposals().getData(), proposal -> !proposal.getDao().getPolicy().getDefaultVotePolicy().getKind().toString().isEmpty(), "proposals/data/dao/policy/defaultVotePolicy/kind");
        searchApiSteps.assertCollectionElementsHasValue(searchResult.getProposals().getData(), proposal -> !proposal.getDao().getPolicy().getDefaultVotePolicy().getRatio().isEmpty(), "proposals/data/dao/policy/defaultVotePolicy/ratio");

        searchApiSteps.assertCollectionElementsHasValue(searchResult.getProposals().getData(), proposal -> proposal.getPermissions().getIsCouncil(), "proposals/data/permissions/isCouncil");
        searchApiSteps.assertCollectionElementsHasValue(searchResult.getProposals().getData(), proposal -> proposal.getPermissions().getCanApprove(), "proposals/data/permissions/canApprove");
        searchApiSteps.assertCollectionElementsHasValue(searchResult.getProposals().getData(), proposal -> proposal.getPermissions().getCanReject(), "proposals/data/permissions/canReject");
        searchApiSteps.assertCollectionElementsHasValue(searchResult.getProposals().getData(), proposal -> proposal.getPermissions().getCanDelete(), "proposals/data/permissions/canDelete");
        searchApiSteps.assertCollectionElementsHasValue(searchResult.getProposals().getData(), proposal -> proposal.getPermissions().getCanAdd(), "proposals/data/permissions/canAdd");

        searchApiSteps.assertDtoValue(searchResult, r -> r.getProposals().getCount().intValue(), 5, "proposals/pageCount");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getProposals().getTotal().intValue(), 5, "proposals/total");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getProposals().getPage().intValue(), page, "proposals/page");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getProposals().getPageCount().intValue(), pageCount, "proposals/pageCount");

        searchApiSteps.assertCollectionHasCorrectSize(searchResult.getMembers().getData(), 0);
        searchApiSteps.assertDtoValue(searchResult, r -> r.getMembers().getPage().intValue(), page, "members/page");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getMembers().getPageCount().intValue(), pageCount, "members/pageCount");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getMembers().getCount().intValue(), 0, "members/count");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getMembers().getTotal().intValue(), 0, "members/total");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Performing search with query param: [sort, offset, query, accountId]")
    @DisplayName("Performing search with query param: [sort, offset, query, accountId]")
    void performingSearchWithSortOffsetQueryAccountIdParams() {
        String searchQuery = "test-dao";
        String accountId = "testdao2.testnet";
        String sort = "createdAt,ASC";
        int limit = 5;

        Map<String, Object> query = Map.of(
                "query",searchQuery,
                "accountId", accountId,
                "offset", 5,
                "sort", sort,
                "limit", limit
        );

        SearchResultDto searchResult = searchApiSteps.search(query).then()
                .statusCode(HTTP_OK)
                .extract().as(SearchResultDto.class);

        List<OffsetDateTime> daosCreatedAtList = searchResult.getDaos().getData().stream()
                .map(DaoResponseV1::getCreatedAt)
                .collect(Collectors.toList());

        List<OffsetDateTime> proposalsCreatedAtList = searchResult.getProposals().getData().stream()
                .map(Proposal::getCreatedAt)
                .collect(Collectors.toList());

        searchApiSteps.assertOffsetDateTimesAreSortedCorrectly(daosCreatedAtList, OffsetDateTime::compareTo, "DAOs should be sorted by 'createdAt' in ASC order");
        searchApiSteps.assertOffsetDateTimesAreSortedCorrectly(proposalsCreatedAtList, OffsetDateTime::compareTo, "Proposals should be sorted by 'createdAt' in ASC order");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getDaos().getCount().intValue(), limit, "daos/count");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getProposals().getCount().intValue(), limit, "proposals/count");
    }

}
