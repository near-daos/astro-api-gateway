package api.app.astrodao.com.core.dto.api.search;

import java.util.List;
import lombok.Data;

public @Data class Proposals{
	private int total;
	private int pageCount;
	private List<DataItem> data;
	private int count;
	private int page;
}