package api.app.astrodao.com.steps.newsearch;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.controllers.newsearch.NewSearchApi;
import api.app.astrodao.com.core.controllers.newsearch.enums.SearchRequestPathEnum;
import api.app.astrodao.com.steps.BaseSteps;
import io.qameta.allure.Step;
import io.restassured.response.Response;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Steps
@RequiredArgsConstructor
public class NewSearchApiSteps extends BaseSteps {
	private final NewSearchApi newSearchApi;

	@Step("Searching by {requestParam} by fields filter {'fields'} with search query {'searchQuery'}")
	public Response search(SearchRequestPathEnum requestParam, List<?> fields, String searchQuery) {
		return newSearchApi.search(requestParam, fields, searchQuery);
	}
}