package api.app.astrodao.com.core.dto.newsearch.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class HitsItem {

	@JsonProperty("_index")
	private String index;

	@JsonProperty("_type")
	private String type;

	@JsonProperty("_source")
	private Source source;

	@JsonProperty("_id")
	private String id;

	@JsonProperty("_score")
	private Double score;
}