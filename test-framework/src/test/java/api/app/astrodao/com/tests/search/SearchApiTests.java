package api.app.astrodao.com.tests.search;

import api.app.astrodao.com.core.dto.api.search.DataItem;
import api.app.astrodao.com.core.dto.api.search.SearchResultDto;
import api.app.astrodao.com.steps.SearchApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import io.restassured.response.Response;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import api.app.astrodao.com.core.enums.HttpStatus;

import java.util.Map;

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

        Response response = searchApiSteps.search(query);
        searchApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        SearchResultDto searchResult = searchApiSteps.getResponseDto(response, SearchResultDto.class);

        searchApiSteps.assertDtoValue(searchResult, r -> r.getDaos().getPage(), page, "daos/page");
        searchApiSteps.assertDtoValueGreaterThan(searchResult, r -> r.getDaos().getPageCount(), page, "daos/pageCount");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getDaos().getCount(), count, "daos/count");
        searchApiSteps.assertDtoValueGreaterThan(searchResult, r -> r.getDaos().getTotal(), count, "daos/total");

        //TODO: Uncomment after adding proper model
        //searchApiSteps.assertDtoValue(searchResult, r -> r.getProposals().getPage().intValue(), page, "proposals/page");
        //searchApiSteps.assertDtoValueGreaterThan(searchResult, r -> r.getProposals().getPageCount().intValue(), page, "proposals/pageCount");
        //searchApiSteps.assertDtoValue(searchResult, r -> r.getProposals().getCount().intValue(), count, "proposals/count");
        //searchApiSteps.assertDtoValueGreaterThan(searchResult, r -> r.getProposals().getTotal().intValue(), count, "proposals/total");
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

        Response response = searchApiSteps.search(queryParams);
        searchApiSteps.assertResponseStatusCode(response, HttpStatus.BAD_REQUEST);
        searchApiSteps.assertStringContainsValue(response.body().asString(), "query must be a string");
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

        ResponseEntity<String> response = searchApiSteps.search(query);
        searchApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        SearchResultDto searchResult = searchApiSteps.getResponseDto(response, SearchResultDto.class);

        searchApiSteps.assertDtoValue(searchResult, r -> r.getDaos().getCount(), count, "daos/count");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getDaos().getTotal(), total, "daos/total");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getDaos().getPage(), page, "daos/page");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getDaos().getPageCount(), pageCount, "daos/pageCount");
        searchApiSteps.assertCollectionElementsContainsOnly(searchResult.getDaos().getData(), DataItem::getId, daoId, "id");
        searchApiSteps.assertCollectionElementsContainsOnly(searchResult.getProposals().getData(), DataItem::getDaoId, daoId, "proposals/daoId");
        searchApiSteps.assertCollectionElementsContainsOnly(searchResult.getProposals().getData(), DataItem::getProposer, accountId, "proposals/proposer");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getProposals().getPageCount(), pageCount, "proposals/pageCount");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getProposals().getTotal(), 5, "proposals/total");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getProposals().getPage(), page, "proposals/page");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getProposals().getPageCount(), pageCount, "proposals/pageCount");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getMembers().getPage(), page, "members/page");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getMembers().getPageCount(), pageCount, "members/pageCount");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getMembers().getCount(), 0, "members/count");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getMembers().getTotal(), 0, "members/total");
    }
}
