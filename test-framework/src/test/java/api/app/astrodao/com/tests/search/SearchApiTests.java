package api.app.astrodao.com.tests.search;

import api.app.astrodao.com.core.dto.api.search.DataItem;
import api.app.astrodao.com.core.dto.api.search.SearchResultDto;
import api.app.astrodao.com.steps.SearchApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import io.restassured.response.Response;
import lombok.RequiredArgsConstructor;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

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

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Performing search with query param: [limit, offset]")
    @DisplayName("Performing search with query param: [limit, offset]")
    void performingSearchWithLimitOffsetParams() {
        int page = 1;
        int count = 5;
        Map<String, Object> query = Map.of(
                "query","dao",
                "limit", count,
                "offset", 0
        );

        SearchResultDto searchResult = searchApiSteps.search(query).then()
                .statusCode(HTTP_OK)
                .extract().as(SearchResultDto.class);

        searchApiSteps.assertDtoValue(searchResult, r -> r.getDaos().getPage(), page, "daos/page");
        searchApiSteps.assertDtoValueGreaterThan(searchResult, r -> r.getDaos().getPageCount(), page, "daos/pageCount");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getDaos().getCount(), count, "daos/count");
        searchApiSteps.assertDtoValueGreaterThan(searchResult, r -> r.getDaos().getTotal(), count, "daos/total");

        searchApiSteps.assertDtoValue(searchResult, r -> r.getProposals().getPage(), page, "proposals/page");
        searchApiSteps.assertDtoValueGreaterThan(searchResult, r -> r.getProposals().getPageCount(), page, "proposals/pageCount");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getProposals().getCount(), count, "proposals/count");
        searchApiSteps.assertDtoValueGreaterThan(searchResult, r -> r.getProposals().getTotal(), count, "proposals/total");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
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
        String accountId = "testdao2.testnet";

        Map<String, Object> query = Map.of(
                "query",daoId,
                "accountId", accountId
        );

        SearchResultDto searchResult = searchApiSteps.search(query).then()
                .statusCode(HTTP_OK)
                .extract().as(SearchResultDto.class);

        searchApiSteps.assertDtoValue(searchResult, r -> r.getDaos().getCount(), count, "daos/count");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getDaos().getTotal(), total, "daos/total");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getDaos().getPage(), page, "daos/page");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getDaos().getPageCount(), pageCount, "daos/pageCount");
        searchApiSteps.assertCollectionContainsOnly(searchResult.getDaos().getData(), DataItem::getId, daoId, "id");
        searchApiSteps.assertCollectionContainsOnly(searchResult.getProposals().getData(), DataItem::getDaoId, daoId, "proposals/daoId");
        searchApiSteps.assertCollectionContainsOnly(searchResult.getProposals().getData(), DataItem::getProposer, accountId, "proposals/proposer");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getProposals().getPageCount(), pageCount, "proposals/pageCount");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getProposals().getTotal(), 5, "proposals/total");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getProposals().getPage(), page, "proposals/page");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getProposals().getPageCount(), pageCount, "proposals/pageCount");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getMembers().getPage(), page, "members/page");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getMembers().getPageCount(), pageCount, "members/pageCount");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getMembers().getCount(), 0, "members/count");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getMembers().getTotal(), 0, "members/total");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Performing search with query param: [sort, query, accountId]")
    @DisplayName("Performing search with query param: [sort, query, accountId]")
    void performingSearchWithSortQueryAccountIdParams() {
        String searchQuery = "testdao";
        String accountId = "testdao2.testnet";
        String sort = "createdAt,ASC";
        int limit = 5;

        Map<String, Object> query = Map.of(
                "query",searchQuery,
                "accountId", accountId,
                "sort", sort,
                "limit", limit
        );

        SearchResultDto searchResult = searchApiSteps.search(query).then()
                .statusCode(HTTP_OK)
                .extract().as(SearchResultDto.class);

        List<String> daosCreatedAtList = searchResult.getDaos().getData().stream()
                .map(DataItem::getCreatedAt)
                .collect(Collectors.toList());

        List<String> proposalsCreatedAtList = searchResult.getProposals().getData().stream()
                .map(DataItem::getCreatedAt)
                .collect(Collectors.toList());

        searchApiSteps.assertStringsAreSortedCorrectly(daosCreatedAtList, String::compareTo, "DAOs should be sorted by 'createdAt' in ASC order");
        searchApiSteps.assertStringsAreSortedCorrectly(proposalsCreatedAtList, String::compareTo, "Proposals should be sorted by 'createdAt' in ASC order");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getDaos().getCount(), limit, "daos/count");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getProposals().getCount(), limit, "proposals/count");
    }
}
