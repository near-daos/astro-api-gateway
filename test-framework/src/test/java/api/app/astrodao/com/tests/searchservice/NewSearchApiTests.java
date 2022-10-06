package api.app.astrodao.com.tests.searchservice;

import api.app.astrodao.com.core.controllers.newsearch.enums.SearchRequestPathEnum;
import api.app.astrodao.com.core.dto.newsearch.request.enums.ProposalFieldsEnum;
import api.app.astrodao.com.core.dto.newsearch.response.HitsItem;
import api.app.astrodao.com.core.dto.newsearch.response.NewSearchResponse;
import api.app.astrodao.com.core.dto.newsearch.response.Total;
import api.app.astrodao.com.steps.newsearch.NewSearchApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static java.net.HttpURLConnection.HTTP_OK;

@Tags({@Tag("all"), @Tag("newSearchApiTests")})
@Epic("Search")
@Feature("New search API tests")
@DisplayName("New search API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class NewSearchApiTests extends BaseTest {
	private final NewSearchApiSteps newSearchApiSteps;

//	@Value("${accounts.account1.accountId}")
//	private String account1Id;


	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Search for proposals by 'description' param by total match")
	@DisplayName("Search for proposals by 'description' param by total match")
	void getProposalsSearchResultsByDescriptionParam() {
		String queryString = "\"poll proposal draft1_1\"";
		String proposalId = "test-dao-for-ui-uno.sputnikv2.testnet-29";

		NewSearchResponse searchResponse = newSearchApiSteps.search(
						SearchRequestPathEnum.PROPOSAL,
						List.of(ProposalFieldsEnum.DESCRIPTION.getFieldValue()),
						queryString)
				.then()
				.statusCode(HTTP_OK)
				.extract().as(NewSearchResponse.class);

		newSearchApiSteps.assertDtoValue(searchResponse.getHits().getTotal(), Total::getValue, 1, "hits/total/value");
		newSearchApiSteps.assertDtoValue(searchResponse.getHits().getTotal(), Total::getRelation, "eq", "hits/total/relation");

		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), HitsItem::getIndex, "proposal", "hits/hits/index");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), HitsItem::getType, "_doc", "hits/hits/type");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), HitsItem::getId, proposalId, "hits/hits/id");
	}
}
