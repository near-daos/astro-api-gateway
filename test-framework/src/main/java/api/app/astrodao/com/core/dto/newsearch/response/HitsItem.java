package api.app.astrodao.com.core.dto.newsearch.response;

import lombok.Data;

@Data
public class HitsItem{
	private String index;
	private String type;
	private Source source;
	private String id;
	private Double score;
}