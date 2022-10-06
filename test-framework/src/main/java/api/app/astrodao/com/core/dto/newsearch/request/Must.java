package api.app.astrodao.com.core.dto.newsearch.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Must {
	@JsonProperty("simple_query_string")
	private SimpleQueryString simpleQueryString;
}