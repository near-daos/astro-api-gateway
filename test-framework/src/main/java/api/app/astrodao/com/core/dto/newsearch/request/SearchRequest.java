package api.app.astrodao.com.core.dto.newsearch.request;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class SearchRequest {
	private Query query;

	public static SearchRequest getRequestBody(String query, List<?> enumFields) {
		return new SearchRequest(new Query(new Bool(new Must(new SimpleQueryString(query, enumFields)))));
	}
}