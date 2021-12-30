package api.app.astrodao.com.tests;

import api.app.astrodao.com.core.dto.api.search.SearchResultDto;
import api.app.astrodao.com.steps.SearchApiSteps;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@Tags({@Tag("all"), @Tag("searchApiTests")})
@Feature("SEARCH API TESTS")
@DisplayName("SEARCH API TESTS")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class SearchApiTests extends BaseTest {
    private final SearchApiSteps searchApiSteps;

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Performing search with query param: [limit, offset]")
    void performingSearchWithLimitOffsetParams() {
        int page = 1;
        int count = 5;
        Map<String, Object> query = Map.of(
                "query","dao",
                "limit", count,
                "offset", 0
        );

        ResponseEntity<String> response = searchApiSteps.search(query);
        searchApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        SearchResultDto searchResult = searchApiSteps.getResponseDto(response, SearchResultDto.class);

        searchApiSteps.assertDtoValue(searchResult, r -> r.getDaos().getPage().intValue(), page, "daos/page");
        searchApiSteps.assertDtoValueGreaterThan(searchResult, r -> r.getDaos().getPageCount().intValue(), page, "daos/pageCount");
        searchApiSteps.assertDtoValue(searchResult, r -> r.getDaos().getCount().intValue(), count, "daos/count");
        searchApiSteps.assertDtoValueGreaterThan(searchResult, r -> r.getDaos().getTotal().intValue(), count, "daos/total");

        //TODO: Uncomment after adding proper model
        //searchApiSteps.assertDtoValue(searchResult, r -> r.getProposals().getPage().intValue(), page, "proposals/page");
        //searchApiSteps.assertDtoValueGreaterThan(searchResult, r -> r.getProposals().getPageCount().intValue(), page, "proposals/pageCount");
        //searchApiSteps.assertDtoValue(searchResult, r -> r.getProposals().getCount().intValue(), count, "proposals/count");
        //searchApiSteps.assertDtoValueGreaterThan(searchResult, r -> r.getProposals().getTotal().intValue(), count, "proposals/total");
    }
}
