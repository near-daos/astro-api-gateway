package api.app.astrodao.com.core.dto.newsearch.response;

import lombok.Data;

@Data
public class NewSearchResponse{
	private Shards shards;
	private Hits hits;
	private Integer took;
	private Boolean timedOut;
}