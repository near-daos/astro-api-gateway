package api.app.astrodao.com.core.dto.api.search;

import lombok.Data;

import java.util.List;

@Data
public class Members {
	private int pageCount;
	private int total;
	private List<DataItem> data;
	private int count;
	private int page;
}