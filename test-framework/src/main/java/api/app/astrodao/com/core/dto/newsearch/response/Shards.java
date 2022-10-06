package api.app.astrodao.com.core.dto.newsearch.response;

import lombok.Data;

@Data
public class Shards {
	private Integer total;
	private Integer failed;
	private Integer successful;
	private Integer skipped;
}