package api.app.astrodao.com.core.controllers.newsearch;

import api.app.astrodao.com.core.controllers.newsearch.enums.SearchRequestPathEnum;
import api.app.astrodao.com.core.dto.newsearch.request.SearchRequest;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

import static api.app.astrodao.com.core.Constants.NewSearchServiceEndpoints.SEARCH;
import static io.restassured.RestAssured.given;

@Component
@RequiredArgsConstructor
public class NewSearchApi {

	private final RequestSpecification requestSpecForSearchService;

	public Response search(SearchRequestPathEnum requestParam, List<?> fields, String searchQuery) {
		SearchRequest searchRequestBody = SearchRequest.getRequestBody(searchQuery, fields);

		return given().spec(requestSpecForSearchService)
				.accept(ContentType.JSON)
				.basePath(requestParam.getFieldValue())
				.body(searchRequestBody)
				.post(SEARCH);
	}
}