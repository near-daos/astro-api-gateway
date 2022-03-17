package api.app.astrodao.com.core.dto.api.search;

import java.util.List;
import lombok.Data;

public @Data class Members{
	private int pageCount;
	private int total;
	private List<DataItem> data;
	private int count;
	private int page;
}