package api.app.astrodao.com.core.dto.newsearch.response;

import lombok.Data;

import java.util.List;

@Data
public class Hits {
	private List<HitsItem> hits;
	private Total total;
	private Double maxScore;
}