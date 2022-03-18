package api.app.astrodao.com.core.dto.api.search;

import lombok.Data;

import java.util.List;

@Data
public class Proposals {
	private int total;
	private int pageCount;
	private List<DataItem> data;
	private int count;
	private int page;
}